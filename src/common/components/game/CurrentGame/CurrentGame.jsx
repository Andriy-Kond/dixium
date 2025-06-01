import useEmblaCarousel from "embla-carousel-react";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";
import css from "./CurrentGame.module.scss";
import GameBottomBar from "common/components/game/GameBottomBar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GUESSING, ROUND_RESULTS, VOTING } from "utils/generals/constants.js";
import socket from "services/socket.js";
import {
  selectActiveScreen,
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectUserCredentials,
  selectPreloadImg,
  selectLocalGame,
} from "redux/selectors.js";
import { calculatePoints } from "utils/game/calculatePoints.js";
import { prepareRoundResults } from "utils/game/prepareRoundResults.js";
import {
  addPreviewId,
  resetPreload,
  setActiveScreen,
  setHasPreloaded,
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";

import { useTranslation } from "react-i18next";
import SortPlayers from "../SortPlayers/index.js";
import ParagraphText from "../ParagraphText/ParagraphText.jsx";

export default function CurrentGame() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameId } = useParams();

  const currentGame = useSelector(selectLocalGame(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const activeScreen = useSelector(selectActiveScreen(gameId, playerId)); // Number of current active screen

  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

  const { totalPreviews, loadedPreviews, preloadUrls, hasPreloaded } =
    useSelector(selectPreloadImg);
  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );
  const isCarouselModeTableScreen = useSelector(
    selectIsCarouselModeTableScreen(gameId, playerId),
  );

  const [middleButton, setMiddleButton] = useState(null);
  const [isEmblaReady, setIsEmblaReady] = useState(false);
  const linksRef = useRef([]);

  // if (!currentGame) navigate("/game"); // ! не можна викликати навігацію в тілі функції! Треба лише у useEffect
  useEffect(() => {
    if (!currentGame) {
      navigate("/game", { replace: true });
      return;
    }
  }, [currentGame, navigate]);

  //# Page header color and text
  useEffect(() => {
    if (!currentGame) return;
    const { hostPlayerId, players, gameStatus, currentRoundNumber } =
      currentGame;

    const hostPlayer = players.find(player => player._id === hostPlayerId);
    const gameHostNick = hostPlayer.name;

    const headerTitleText =
      activeScreen === 0
        ? t("hand")
        : activeScreen === 1
        ? t("players")
        : t("table");

    const headerTitleTextSecond = t("whom_game", { gameHostNick });

    if (gameStatus === ROUND_RESULTS && activeScreen === 2) {
      dispatch(setPageHeaderText(t("round", { currentRoundNumber })));
    } else {
      dispatch(setPageHeaderText(headerTitleText));
    }

    dispatch(setPageHeaderTextSecond(headerTitleTextSecond));
  }, [activeScreen, currentGame, dispatch, t]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start", // Вирівнювання слайдів
    watchDrag: !(isCarouselModeHandScreen || isCarouselModeTableScreen), // дозвіл на слайдінг при цій умові
  });

  // addPreviewId
  useEffect(() => {
    if (!currentGame) return;
    const { players, cardsOnTable } = currentGame;

    const currentPlayer = players.find(p => p._id === playerId);
    if (currentPlayer) {
      const allCards = [...currentPlayer.hand, ...cardsOnTable];
      allCards.forEach(card => {
        dispatch(addPreviewId(card.public_id));
        // console.log("Adding previewId in Game", card.public_id);
      });
    }
    // console.log("Adding previewIds for", allCards.length, "cards");
  }, [currentGame, dispatch, playerId]);

  // Preload large imgs (by add <link> to document.head)
  useEffect(() => {
    // Очищаємо старі лінки, якщо кількість URL змінилася
    if (linksRef.current.length > preloadUrls.length) {
      // console.log("очищення linksRef.current");
      linksRef.current.forEach(link => {
        // Перевірка, чи є link у document.head
        if (document.head.contains(link)) document.head.removeChild(link);
      });

      // Оновлення linksRef.current
      linksRef.current = [];
    }

    // Завантажити лише нові URL, які ще не предзавантажені (ще не є в linksRef.current)
    const urlsToPreload = preloadUrls.filter(
      url => !linksRef.current.some(link => link.href === url),
    );

    if (urlsToPreload.length > 0) {
      // console.log("Starting preload for new URLs:", urlsToPreload);
      urlsToPreload.slice(0, 10).forEach(preloadUrl => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = preloadUrl;
        link.fetchpriority = "high";
        link.crossorigin = "anonymous";
        link.onerror = () =>
          // console.log(`Failed to preload image: ${preloadUrl}`);
          document.head.appendChild(link);
        linksRef.current.push(link);
      });
      // console.log("Links in head:", linksRef.current.length);

      if (loadedPreviews === totalPreviews && totalPreviews > 0) {
        dispatch(setHasPreloaded());
      }
    }
  }, [dispatch, loadedPreviews, preloadUrls, totalPreviews]);

  // Clear <link> from document.head after unmount Game.jsx
  useEffect(() => {
    return () => {
      // console.log("Game unmounted, cleaning up...");
      linksRef.current.forEach(link => {
        // console.log(" return >> link:::", link);
        // Перевірка, чи є link у document.head
        if (document.head.contains(link)) document.head.removeChild(link);
      });
      linksRef.current = [];
      dispatch(resetPreload());
    };
  }, [dispatch]);

  // Якщо треба додати можливість змінювати activeScreen вручну (наприклад, через зовнішній UI), то це буде гарантією, що карусель завжди синхронізується зі станом activeScreen
  useEffect(() => {
    if (emblaApi) {
      // emblaApi.scrollTo(isShowMask ? 0 : activeScreen);
      isShowMask ? emblaApi.scrollTo(0) : emblaApi.scrollTo(activeScreen);
      setIsEmblaReady(true); // Щоб карусель після F5 одразу була на останньому активному екрані без ефекту перемотування
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

  const startVoting = useCallback(() => {
    // todo: протестувати без useCallBack
    if (!currentGame) return;

    const updatedGame = {
      ...currentGame,
      cardsOnTable: shuffleDeck(currentGame.cardsOnTable),
      gameStatus: VOTING,
    };

    socket.emit("startVoting", { updatedGame });
  }, [currentGame]);

  useEffect(() => {
    if (!currentGame) return;
    const { players, gameStatus } = currentGame;

    const isReadyToVote = !players.some(player => !player.isGuessed);
    isReadyToVote && gameStatus === GUESSING && startVoting();
  }, [currentGame, startVoting]);

  const finishRound = useCallback(() => {
    // todo: протестувати без useCallBack
    if (!currentGame) return;

    const {
      players,
      storytellerId,
      cardsOnTable,
      votes,
      scores,
      isSingleCardMode,
    } = currentGame;

    const updatedScores = calculatePoints({
      players,
      storytellerId,
      cardsOnTable,
      votes,
      scores,
      isSingleCardMode,
    });

    const roundResults = prepareRoundResults({
      cardsOnTable,
      votes,
      players,
      storytellerId,
    });

    const updatedGame = {
      ...currentGame,
      scores: updatedScores,
      gameStatus: ROUND_RESULTS,
      roundResults, // для більш зручного рендерингу результатів (не обов'язково)
    };

    socket.emit("roundFinish", { updatedGame });
  }, [currentGame]);

  useEffect(() => {
    if (!currentGame) return;
    const { players, gameStatus } = currentGame;

    const isReadyToCalculatePoints = players.every(player => player.isVoted);
    isReadyToCalculatePoints && gameStatus === VOTING && finishRound();
  }, [currentGame, finishRound]);

  const stabilizedSetMiddleButton = useCallback(value => {
    // todo: протестувати без useCallBack
    setMiddleButton(value);
  }, []);

  // Навігація через Embla API
  const prevScreen = () => {
    emblaApi?.scrollPrev();
  };
  const nextScreen = () => {
    emblaApi?.scrollNext();
  };

  if (!currentGame) return null;

  const { isGameRunning, storytellerId, gameStatus } = currentGame;

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const isBlockScreens = isShowMask && !isCurrentPlayerStoryteller;
  const screens = isBlockScreens
    ? [<Hand />]
    : [<Hand />, <Players />, <Table />];

  if (!isGameRunning) return <SortPlayers />;

  return (
    <div className={css.gameContainer}>
      {gameStatus !== ROUND_RESULTS && <ParagraphText />}

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
              })}
            </li>
          ))}
        </ul>
      </div>

      <GameBottomBar
        activeScreen={activeScreen}
        screensLength={screens.length}
        onPrevScreen={prevScreen}
        onNextScreen={nextScreen}
        middleButton={middleButton}
        isShowSidesBtns={
          !isCarouselModeHandScreen && !isCarouselModeTableScreen
        }
      />
    </div>
  );
}
