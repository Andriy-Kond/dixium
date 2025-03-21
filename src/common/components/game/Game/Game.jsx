import useEmblaCarousel from "embla-carousel-react";

import { cloneElement, useCallback, useEffect, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";

import css from "./Game.module.scss";
import GameNavigationBar from "common/components/game/GameNavigationBar";
import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";
import { ROUND_RESULTS, VOTING } from "utils/generals/constants.js";
import socket from "services/socket.js";
import {
  selectActiveScreen,
  selectCardsOnTable,
  selectGame,
  selectGamePlayers,
  selectIsFirstTurn,
  selectIsShowMask,
  selectIsSingleCardMode,
  selectScores,
  selectStorytellerId,
  selectUserCredentials,
  selectVotes,
} from "redux/selectors.js";
import { calculatePoints } from "utils/game/calculatePoints.js";
import { prepareRoundResults } from "utils/game/prepareRoundResults.js";
import { setActiveScreen } from "redux/game/localPersonalSlice.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";

export default function Game() {
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const scores = useSelector(selectScores(gameId));
  const votes = useSelector(selectVotes(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const isFirstTurn = useSelector(selectIsFirstTurn(gameId));
  const activeScreen = useSelector(selectActiveScreen(gameId, playerId));
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

  // const [localActiveScreen, setLocalActiveScreen] = useState(activeScreen);

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const isBlockScreens = isShowMask && !isCurrentPlayerStoryteller;

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
    // startIndex: activeScreen, // Початковий індекс береться з Redux (!не працюють стилі слайдінгу)
    watchDrag: !(isCarouselModeHandScreen || isCarouselModeTableScreen), // дозвіл на слайдінг при цій умові
    // isCarouselModeHandScreen || isCarouselModeTableScreen
    //   ? ""
    //   : "is-draggable",

    // Адаптивні налаштування для різних розмірів екрану
    // breakpoints: {
    //   "(min-width: 768px)": { loop: true }, // увімкнути зациклення на екранах ширше 768px.
    // },
  });

  const screens = isBlockScreens
    ? [<Hand />]
    : [<Hand />, <Players />, <Table />];

  // Навігація через Embla API
  const prevScreen = () => {
    emblaApi?.scrollPrev();
  };
  const nextScreen = () => {
    emblaApi?.scrollNext();
  };

  const startVoting = useCallback(() => {
    const updatedGame = {
      ...currentGame,
      cardsOnTable: shuffleDeck(currentGame.cardsOnTable),
      gameStatus: VOTING,
    };

    socket.emit("startVoting", { updatedGame });
  }, [currentGame]);

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

  const [isEmblaReady, setIsEmblaReady] = useState(false);
  // Якщо треба додати можливість змінювати activeScreen вручну (наприклад, через зовнішній UI), то це буде гарантією, що карусель завжди синхронізується зі станом activeScreen
  useEffect(() => {
    if (emblaApi) {
      isShowMask ? emblaApi.scrollTo(0) : emblaApi.scrollTo(activeScreen);

      // Щоб карусель після F5 одразу була на останньому активному екрані без ефекту перемотування
      setIsEmblaReady(true);
    }
  }, [activeScreen, emblaApi, isShowMask]);

  // reInit потрібен для застосування динамічних змін у налаштуваннях useEmblaCarousel (watchDrag, breakpoints тощо), або якщо динамічно змінюється кількість слайдів каруселі тощо
  useEffect(() => {
    if (emblaApi)
      emblaApi.reInit({
        watchDrag: !(isCarouselModeHandScreen || isCarouselModeTableScreen),
      });
  }, [emblaApi, isCarouselModeHandScreen, isCarouselModeTableScreen]);

  // Синхронізація activeScreen з Embla Carousel
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const newScreen = emblaApi.selectedScrollSnap();
      // setLocalActiveScreen(newScreen);
      dispatch(
        setActiveScreen({
          gameId,
          playerId: playerId,
          screen: newScreen,
        }),
      );
    };

    emblaApi.on("select", onSelect); // Слухаємо подію зміни слайду
    return () => emblaApi.off("select", onSelect);
  }, [activeScreen, dispatch, emblaApi, gameId, playerId]);

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
    <div className={css.gameContainer}>
      <p>Game</p>

      <div
        className={`${css.swipeWrapper} ${!isEmblaReady && css.visuallyHidden}`}
        ref={emblaRef}>
        <ul className={css.screenWrapper}>
          {screens.map((screen, index) => (
            <li className={css.screenContainer} key={index}>
              {cloneElement(screen, {
                isActiveScreen: activeScreen === index,
                setMiddleButton: stabilizedSetMiddleButton,
                isCarouselModeHandScreen,
                setIsCarouselModeHandScreen,
                isCarouselModeTableScreen,
                setIsCarouselModeTableScreen,
                finishRound,
                startVoting,
              })}
            </li>
          ))}
        </ul>
      </div>

      <GameNavigationBar
        activeScreen={activeScreen}
        screensLength={screens.length}
        onPrevScreen={prevScreen}
        onNextScreen={nextScreen}
        middleButton={middleButton}
        sidesButtons={!isCarouselModeHandScreen && !isCarouselModeTableScreen}
      />
    </div>
  );
}
