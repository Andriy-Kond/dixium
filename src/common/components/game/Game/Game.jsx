import useEmblaCarousel from "embla-carousel-react";

import { cloneElement, useEffect, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";

import css from "./Game.module.scss";
import GameNavigationBar from "common/components/game/GameNavigationBar";
import CardCarousel from "../CardCarousel/CardCarousel.jsx";
import { useSelector } from "react-redux";
import { selectPlayerHand, selectUserCredentials } from "redux/selectors.js";
import { useLocation } from "react-router-dom";

export default function Game() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [middleButton, setMiddleButton] = useState(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start", // Вирівнювання слайдів:
    // 'start' — Слайди вирівнюються по лівому краю.
    // 'center' — Слайди центруються (за замовчуванням).
    // 'end' — Слайди вирівнюються по правому краю.
    dragFree: false, // Вільне прокручування без прив'язки до слайдів якщо true
    slidesToScroll: 1, // Кількість слайдів, які прокручуються за один раз
    duration: 30, // Швидкість анімації прокручування (не в мілісекундах, а в умовних одиницях, рекомендовано 20–60)
    skipSnaps: false, // Дозволяє пропускати слайди при сильному свайпі якщо true

    // Адаптивні налаштування для різних розмірів екрану
    breakpoints: {
      "(min-width: 768px)": { loop: true }, // увімкнути зациклення на екранах ширше 768px.
    },
  });

  // Отримання поточного індексу слайду для пропсів
  const getActiveScreen = () => emblaApi?.selectedScrollSnap() || 0;
  const [isCarouselMode, setIsCarouselMode] = useState(false); // Режим каруселі для збільшених карт

  const location = useLocation();
  const match = location.pathname.match(/game\/([\w\d]+)/);
  const currentGameId = match ? match[1] : null;
  const userCredentials = useSelector(selectUserCredentials);
  const playerHand = useSelector(
    selectPlayerHand(currentGameId, userCredentials._id),
  );

  const screens = [<Hand />, <Players />, <Table />];

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(activeScreen);
  }, [activeScreen, emblaApi]);

  // Синхронізація activeScreen з Embla Carousel
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveScreen(emblaApi.selectedScrollSnap());

    emblaApi.on("select", onSelect); // Слухаємо подію зміни слайду
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  // Навігація через Embla API
  const prevScreen = () => {
    emblaApi?.scrollPrev();
  };
  const nextScreen = () => {
    emblaApi?.scrollNext();
  };

  // KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApi) return;
      if (event.key === "ArrowLeft") {
        emblaApi.scrollPrev();
      } else if (event.key === "ArrowRight") {
        emblaApi.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApi]);

  return (
    <>
      <p>Game</p>
      <div className={css.swipeWrapper} ref={emblaRef}>
        <div className={css.screenWrapper}>
          {screens.map((screen, index) => (
            <div className={css.screenContainer} key={index}>
              {cloneElement(screen, {
                isActive: getActiveScreen() === index, // Актуальний індекс
                setActiveScreen,
                setMiddleButton,
              })}
            </div>
          ))}
        </div>
      </div>

      <GameNavigationBar
        activeScreen={getActiveScreen()}
        screensLength={screens.length}
        onPrevScreen={prevScreen}
        onNextScreen={nextScreen}
        middleButton={middleButton}
      />
    </>
  );
}
