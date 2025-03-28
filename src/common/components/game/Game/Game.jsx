import useEmblaCarousel from "embla-carousel-react";

import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
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
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectIsSingleCardMode,
  selectZoomCardId,
  selectScores,
  selectStorytellerId,
  selectUserCredentials,
  selectVotes,
  selectToastId,
} from "redux/selectors.js";
import { calculatePoints } from "utils/game/calculatePoints.js";
import { prepareRoundResults } from "utils/game/prepareRoundResults.js";
import { setActiveScreen, setToastId } from "redux/game/localPersonalSlice.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";

export default function Game() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const scores = useSelector(selectScores(gameId));
  const votes = useSelector(selectVotes(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const activeScreen = useSelector(selectActiveScreen(gameId, playerId));
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

  const zoomCardId = useSelector(selectZoomCardId(gameId, playerId)); // for zoom card in modal window
  const toastId = useSelector(selectToastId(gameId));

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const isBlockScreens = isShowMask && !isCurrentPlayerStoryteller;

  const [middleButton, setMiddleButton] = useState(null);

  const stabilizedSetMiddleButton = useCallback(value => {
    setMiddleButton(value);
  }, []);

  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );

  const isCarouselModeTableScreen = useSelector(
    selectIsCarouselModeTableScreen(gameId, playerId),
  );

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
    watchDrag: !(
      isCarouselModeHandScreen ||
      isCarouselModeTableScreen ||
      zoomCardId
    ), // дозвіл на слайдінг при цій умові
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
      storytellerId,
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
        watchDrag: !(
          isCarouselModeHandScreen ||
          isCarouselModeTableScreen ||
          zoomCardId
        ),
      });
  }, [
    emblaApi,
    isCarouselModeHandScreen,
    isCarouselModeTableScreen,
    zoomCardId,
  ]);

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
      if (
        !emblaApi ||
        isCarouselModeHandScreen ||
        isCarouselModeTableScreen ||
        zoomCardId
      )
        return;

      if (event.key === "ArrowLeft") {
        emblaApi.scrollPrev();
      } else if (event.key === "ArrowRight") {
        emblaApi.scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    emblaApi,
    isCarouselModeHandScreen,
    isCarouselModeTableScreen,
    zoomCardId,
  ]);

  const localToastRef = useRef(toastId || null); // fore show toast.info 1 time after refresh

  useEffect(() => {
    if (isShowMask) {
      if (!localToastRef.current && !isCurrentPlayerStoryteller) {
        localToastRef.current = true;
        const newToastId = toast.info(
          <>
            {/* <p>
              Player <b>{storyteller?.name.toUpperCase()}</b> told first story.
              <br /> Let's go to guess it!
            </p> */}

            <p>
              <Trans
                i18nKey="player_told_first_story"
                values={{ storytellerName: storyteller?.name.toUpperCase() }}
                components={{ bold: <b />, br: <br /> }} // components - об'єкт, де ключі відповідають тегам у перекладі (<bold>, <br/>), а значення — JSX-компоненти, які мають бути вставлені на їх місце.
              />
            </p>
          </>,

          {
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 1,
            theme: "colored",
            // transition: Bounce,
          },
        );

        dispatch(setToastId({ gameId, playerId, toastId: newToastId }));
      }
    }
  }, [
    dispatch,
    gameId,
    isCurrentPlayerStoryteller,
    isShowMask,
    playerId,
    storyteller?.name,
    t,
    toastId,
  ]);

  return (
    <div className={css.gameContainer}>
      {/* <p>Game</p> */}

      <div
        className={`${css.screenCarouselWrapper} ${
          !isEmblaReady && css.visuallyHidden
        }`}
        ref={emblaRef}>
        <ul className={css.screenCarouselContainer}>
          {screens.map((screen, index) => (
            <li className={css.screenCarouselSlide} key={index}>
              {cloneElement(screen, {
                isActiveScreen: activeScreen === index,
                setMiddleButton: stabilizedSetMiddleButton,
                isCarouselModeHandScreen,
                // setIsCarouselModeHandScreen,
                isCarouselModeTableScreen,
                // setIsCarouselModeTableScreen,
                finishRound,
                startVoting,
                // toggleZoomCardId,
                // setToggleZoomCardId,
                toastId,
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
        isShowSidesBtns={
          !isCarouselModeHandScreen && !isCarouselModeTableScreen && !zoomCardId
        }
      />
    </div>
  );
}
