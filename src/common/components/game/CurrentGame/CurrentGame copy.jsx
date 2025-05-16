import useEmblaCarousel from "embla-carousel-react";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";
import css from "./CurrentGame.module.scss";
import GameNavigationBar from "common/components/game/GameNavigationBar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  GUESSING,
  LOBBY,
  ROUND_RESULTS,
  VOTING,
} from "utils/generals/constants.js";
import socket from "services/socket.js";
import {
  selectActiveScreen,
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectZoomCardId,
  selectUserCredentials,
  selectToastId,
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
  setToastId,
} from "redux/game/localPersonalSlice.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import PageBadge from "common/components/ui/PageBadge/index.js";
import SortPlayers from "../SortPlayers/index.js";

export default function Game() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [middleButton, setMiddleButton] = useState(null);
  const [isEmblaReady, setIsEmblaReady] = useState(false);
  const linksRef = useRef([]);

  const { gameId } = useParams();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const toastId = useSelector(selectToastId(gameId, playerId));
  const activeScreen = useSelector(selectActiveScreen(gameId, playerId));
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));
  const zoomCardId = useSelector(selectZoomCardId(gameId, playerId)); // for zoom card in modal window

  const { totalPreviews, loadedPreviews, preloadUrls, hasPreloaded } =
    useSelector(selectPreloadImg);
  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );
  const isCarouselModeTableScreen = useSelector(
    selectIsCarouselModeTableScreen(gameId, playerId),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start", // Вирівнювання слайдів
    watchDrag: !(
      isCarouselModeHandScreen ||
      isCarouselModeTableScreen ||
      zoomCardId
    ), // дозвіл на слайдінг при цій умові
  });

  const currentGame = useSelector(selectLocalGame(gameId));
  // if (!currentGame) navigate("/game"); // ! не можна викликати навігацію в тілі функції! Треба лише у useEffect

  const {
    players: gamePlayers = [],
    isSingleCardMode = false,
    gameStatus = LOBBY,
    hostPlayerId = "",
    storytellerId = "",
    scores = {},
    votes = {},
    cardsOnTable = [],
  } = currentGame;

  const currentPlayer = gamePlayers.find(p => p._id === playerId) || [];
  const {
    hand: playerHand = [],
    isVoted: isPlayerVoted = false,
    isGuessed: isPlayerGuessed = false,
  } = currentPlayer;

  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const isCurrentPlayerHost = hostPlayerId === playerId;
  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);
  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const isBlockScreens = isShowMask && !isCurrentPlayerStoryteller;
  const screens = isBlockScreens
    ? [<Hand />]
    : [<Hand />, <Players />, <Table />];

  const textAndColorOfHeader = useCallback(() => {
    if (!storytellerId || isShowMask)
      return { isMustMakeMove: true, text: t("first_turn") };

    if (gameStatus === GUESSING && !isPlayerGuessed)
      return { isMustMakeMove: true, text: t("please_choose_card") };

    if (gameStatus === VOTING && !isPlayerVoted)
      return { isMustMakeMove: true, text: t("please_vote") };

    if (gameStatus === GUESSING && isCurrentPlayerHost && isReadyToVote)
      return { isMustMakeMove: true, text: t("all_players_guessed") };

    if (
      gameStatus === VOTING &&
      isCurrentPlayerHost &&
      isReadyToCalculatePoints
    )
      return { isMustMakeMove: true, text: t("all_players_voted") };

    if (gameStatus === ROUND_RESULTS)
      return {
        isMustMakeMove: isCurrentPlayerHost ? true : false,
        text: t("rounds_results"),
      };

    if (gameStatus === LOBBY)
      return {
        isMustMakeMove: isCurrentPlayerStoryteller ? true : false,
        text: isCurrentPlayerStoryteller
          ? t("choose_card")
          : t("storyteller_choses_card", {
              storytellerName: storyteller?.name,
            }),
      };

    return { isMustMakeMove: false, text: t("players_taking_turn") };
  }, [
    gameStatus,
    isCurrentPlayerHost,
    isCurrentPlayerStoryteller,
    isPlayerGuessed,
    isPlayerVoted,
    isReadyToCalculatePoints,
    isReadyToVote,
    isShowMask,
    storyteller?.name,
    storytellerId,
    t,
  ]);

  //# Page header color and text
  useEffect(() => {
    // console.log("condition for", {
    //   storytellerId: !storytellerId,
    //   isShowMask,
    //   isPlayerGuessed: !isPlayerGuessed,
    //   isPlayerVoted: !isPlayerVoted,
    // });
    const gameScores = Object.values(currentGame.scores);

    const [maxId, maxVal] = Object.entries(currentGame.scores).reduce(
      ([maxKey, maxValue], [key, value]) =>
        value > maxValue ? [key, value] : [maxKey, maxValue],
      [null, -Infinity],
    );

    const maxEntries = Object.entries(currentGame.scores).filter(
      ([key, value]) => value === maxVal,
    );

    const winners = currentGame.players.filter(p =>
      maxEntries.some(([key, value]) => key === p._id),
    );
    // console.log("maxEntries:", maxEntries);
    // console.log("winners:", winners);

    // currentGame.players.filter(p => {
    //   const winnersP = maxEntries.filter(([key, value]) => key === p._id);
    //   console.log(" useEffect >> maxEntries:::", maxEntries);
    //       console.log(" gameEnd >> winnersP:::", winnersP);
    // });

    const { isMustMakeMove, text } = textAndColorOfHeader();

    if (isMustMakeMove) {
      dispatch(setPageHeaderText(text));
    } else {
      dispatch(setPageHeaderText(text));
    }
  }, [currentGame.players, currentGame.scores, dispatch, textAndColorOfHeader]);

  // Add all publicId card's from Hand and Table to addPreviewId in Redux state
  useEffect(() => {
    const allCards = [...playerHand, ...cardsOnTable];
    // console.log("Adding previewIds for", allCards.length, "cards");
    allCards.forEach(card => {
      dispatch(addPreviewId(card.public_id));
      // console.log("Adding previewId in Game", card.public_id);
    });
  }, [playerHand, cardsOnTable, dispatch]);

  // Preload large imgs (by add <link> to document.head)
  useEffect(() => {
    // console.log("Preload check:", {
    //   loadedPreviews,
    //   totalPreviews,
    //   hasPreloaded,
    //   preloadUrls,
    // });

    // Очищаємо старі лінки, якщо кількість URL змінилася

    if (linksRef.current.length > preloadUrls.length) {
      // console.log("очищення linksRef.current");
      linksRef.current.forEach(link => document.head.removeChild(link));
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
          console.log(`Failed to preload image: ${preloadUrl}`);
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
      linksRef.current.forEach(link => document.head.removeChild(link));
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

  // Повідомлення. що хтось став першим оповідачем
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

  const startVoting = useCallback(() => {
    // todo: протестувати без useCallBack
    const updatedGame = {
      ...currentGame,
      cardsOnTable: shuffleDeck(currentGame.cardsOnTable),
      gameStatus: VOTING,
    };

    socket.emit("startVoting", { updatedGame });
  }, [currentGame]);

  const finishRound = useCallback(() => {
    // todo: протестувати без useCallBack
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

  useEffect(() => {
    if (!currentGame) {
      navigate("/game", { replace: true });
    }
  }, [currentGame, navigate]);

  if (!currentGame) return null;

  if (!currentGame.isGameRunning) return <SortPlayers />;

  return (
    <div className={css.gameContainer}>
      <p>Game</p>
      <PageBadge />

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
                isCarouselModeTableScreen,
                finishRound,
                startVoting,
                toastId,
                // setIsCarouselModeHandScreen,
                // setIsCarouselModeTableScreen,
                // toggleZoomCardId,
                // setToggleZoomCardId,
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
