import useEmblaCarousel from "embla-carousel-react";

import { cloneElement, useCallback, useEffect, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";

import css from "./Game.module.scss";
import GameNavigationBar from "common/components/game/GameNavigationBar";

export default function Game() {
  const [activeScreen, setActiveScreen] = useState(0);
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
  const [middleButton, setMiddleButton] = useState(null); // Стан для середньої кнопки

  const screens = [<Hand />, <Players />, <Table />];

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(activeScreen);
  }, [activeScreen, emblaApi]);

  // // Навігація через Embla API
  // const nextScreen = () => {
  //   emblaApi?.scrollNext();
  //   setMiddleButton(null); // Очищаємо кнопку при зміні екрану
  // };
  // const prevScreen = () => {
  //   emblaApi?.scrollPrev();
  //   setMiddleButton(null); // Очищаємо кнопку при зміні екрану
  // };

  // // Memoized fn for useEffect:
  // // Перейти до наступного екрану, якщо не останній
  // const nextScreenSimple = useCallback(() => {
  //   setActiveScreen(prev => (prev < screens.length - 1 ? prev + 1 : prev));
  //   setMiddleButton(null); // Очищаємо кнопку при зміні екрану
  // }, [screens.length]);

  // // Перейти до попереднього екрану, якщо не перший
  // const prevScreenSimple = useCallback(() => {
  //   setActiveScreen(prev => (prev > 0 ? prev - 1 : prev));
  //   setMiddleButton(null); // Очищаємо кнопку при зміні екрану
  // }, []);

  // Синхронізація activeScreen з Embla Carousel
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setActiveScreen(emblaApi.selectedScrollSnap());

    emblaApi.on("select", onSelect); // Слухаємо подію зміни слайду
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  // Навігація через Embla API
  const nextScreen = () => {
    emblaApi?.scrollNext();
  };
  const prevScreen = () => {
    emblaApi?.scrollPrev();
  };

  // Отримання поточного індексу слайду для пропсів
  const getActiveScreen = () => emblaApi?.selectedScrollSnap() || 0;

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

      <div
        className={css.swipeWrapper}
        ref={emblaRef}
        style={{ overflow: "hidden" }}>
        <div className={css.screenWrapper}>
          {screens.map((screen, index) => (
            <div className={css.screenContainer} key={index}>
              {cloneElement(screen, {
                setMiddleButton, // Передаємо функцію для оновлення кнопки
                isActive: getActiveScreen() === index, // Актуальний індекс
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
