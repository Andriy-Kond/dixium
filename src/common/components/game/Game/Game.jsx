import useEmblaCarousel from "embla-carousel-react";

import { cloneElement, useCallback, useEffect, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";

import css from "./Game.module.scss";
import GameNavigationBar from "common/components/game/GameNavigationBar";

export default function Game() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [middleButton, setMiddleButton] = useState(null);
  const stabilizedSetMiddleButton = useCallback(value => {
    setMiddleButton(value);
  }, []);

  const [isCarouselMode, setIsCarouselMode] = useState(false);

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
      <div className={css.swipeWrapper} ref={isCarouselMode ? null : emblaRef}>
        <ul className={css.screenWrapper}>
          {screens.map((screen, index) => (
            <li className={css.screenContainer} key={index}>
              {cloneElement(screen, {
                isActiveScreen: getActiveScreen() === index, // Актуальний індекс
                setActiveScreen,
                setMiddleButton: stabilizedSetMiddleButton,
                isCarouselMode,
                setIsCarouselMode,
              })}
            </li>
          ))}
        </ul>
      </div>

      <GameNavigationBar
        activeScreen={getActiveScreen()}
        screensLength={screens.length}
        onPrevScreen={prevScreen}
        onNextScreen={nextScreen}
        middleButton={middleButton}
        sidesButtons={!isCarouselMode}
      />
    </>
  );
}
