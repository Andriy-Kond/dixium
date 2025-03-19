import useEmblaCarousel from "embla-carousel-react";

import { cloneElement, useCallback, useEffect, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";

import css from "./Game.module.scss";
import GameNavigationBar from "common/components/game/GameNavigationBar";
import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";
import { ROUND_RESULTS } from "utils/generals/constants.js";
import socket from "services/socket.js";
import {
  selectCardsOnTable,
  selectGame,
  selectGamePlayers,
  selectIsSingleCardMode,
  selectScores,
  selectStorytellerId,
  selectVotes,
} from "redux/selectors.js";
import { calculatePoints } from "utils/game/calculatePoints.js";
import { prepareRoundResults } from "utils/game/prepareRoundResults.js";

export default function Game() {
  const { gameId } = useParams();
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const scores = useSelector(selectScores(gameId));
  const votes = useSelector(selectVotes(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const [activeScreen, setActiveScreen] = useState(0);
  const [middleButton, setMiddleButton] = useState(null);

  const stabilizedSetMiddleButton = useCallback(value => {
    setMiddleButton(value);
  }, []);

  const [isCarouselModeHandScreen, setIsCarouselModeHandScreen] =
    useState(false);

  const [isCarouselModeTableScreen, setIsCarouselModeTableScreen] =
    useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start", // Вирівнювання слайдів:
    // 'start' — Слайди вирівнюються по лівому краю.
    // 'center' — Слайди центруються (за замовчуванням).
    // 'end' — Слайди вирівнюються по правому краю.
    // dragFree: false, // Вільне прокручування без прив'язки до слайдів якщо true
    // slidesToScroll: 1, // Кількість слайдів, які прокручуються за один раз
    // duration: 30, // Швидкість анімації прокручування (не в мілісекундах, а в умовних одиницях, рекомендовано 20–60)
    // skipSnaps: false, // Дозволяє пропускати слайди при сильному свайпі якщо true

    watchDrag: !(isCarouselModeHandScreen || isCarouselModeTableScreen),
    // isCarouselModeHandScreen || isCarouselModeTableScreen
    //   ? ""
    //   : "is-draggable",

    // Адаптивні налаштування для різних розмірів екрану
    // breakpoints: {
    //   "(min-width: 768px)": { loop: true }, // увімкнути зациклення на екранах ширше 768px.
    // },
  });

  const screens = [<Hand />, <Players />, <Table />];

  // Навігація через Embla API
  const prevScreen = () => {
    emblaApi?.scrollPrev();
  };
  const nextScreen = () => {
    emblaApi?.scrollNext();
  };

  const finishRound = useCallback(() => {
    const updatedScores = calculatePoints({
      gamePlayers,
      storytellerId,
      cardsOnTable,
      votes,
      scores,
      isSingleCardMode,
    });

    const roundResults = prepareRoundResults({
      cardsOnTable,
      votes,
      gamePlayers,
    });
    console.log(" finishRound >> roundResults:::", roundResults);

    const updatedGame = {
      ...currentGame,
      scores: updatedScores,
      gameStatus: ROUND_RESULTS,
      roundResults, // для більш зручного рендерингу результатів (не обов'язково)
    };

    socket.emit("roundFinish", { updatedGame });
  }, [
    cardsOnTable,
    currentGame,
    isSingleCardMode,
    gamePlayers,
    scores,
    storytellerId,
    votes,
  ]);

  useEffect(() => {
    if (!emblaApi) return;

    // reInit потрібен для застосування динамічних змін у налаштуваннях useEmblaCarousel (watchDrag, breakpoints тощо), або якщо динамічно змінюється кількість слайдів каруселі тощо
    emblaApi.reInit({
      watchDrag: !(isCarouselModeHandScreen || isCarouselModeTableScreen),
    });
  }, [emblaApi, isCarouselModeHandScreen, isCarouselModeTableScreen]);

  // Отримання поточного індексу слайду для пропсів
  // const getActiveScreen = () => emblaApi?.selectedScrollSnap() || 0;

  // Якщо треба додати можливість змінювати activeScreen вручну (наприклад, через зовнішній UI), то це буде гарантією, що карусель завжди синхронізується зі станом activeScreen
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

  // KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApi || isCarouselModeHandScreen || isCarouselModeTableScreen)
        return;

      if (event.key === "ArrowLeft") {
        emblaApi.scrollPrev();
      } else if (event.key === "ArrowRight") {
        emblaApi.scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApi, isCarouselModeHandScreen, isCarouselModeTableScreen]);

  return (
    <>
      <p>Game</p>
      <div className={css.swipeWrapper} ref={emblaRef}>
        <ul className={css.screenWrapper}>
          {screens.map((screen, index) => (
            <li className={css.screenContainer} key={index}>
              {cloneElement(screen, {
                // isActiveScreen: getActiveScreen() === index, // Актуальний індекс
                isActiveScreen: activeScreen === index,
                // setActiveScreen,
                setMiddleButton: stabilizedSetMiddleButton,
                isCarouselModeHandScreen,
                setIsCarouselModeHandScreen,
                isCarouselModeTableScreen,
                setIsCarouselModeTableScreen,
                finishRound,
              })}
            </li>
          ))}
        </ul>
      </div>

      <GameNavigationBar
        // activeScreen={getActiveScreen()}
        activeScreen={activeScreen}
        screensLength={screens.length}
        onPrevScreen={prevScreen}
        onNextScreen={nextScreen}
        middleButton={middleButton}
        sidesButtons={!isCarouselModeHandScreen && !isCarouselModeTableScreen}
      />
    </>
  );
}
