// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ToastContainer, toast } from "react-toastify";

import { MdCheck } from "react-icons/md";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import socket from "services/socket.js";

import {
  selectGame,
  selectGamePlayers,
  selectGameStatus,
  selectHostPlayerId,
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectIsSingleCardMode,
  selectPlayerHand,
  selectSelectedCardId,
  selectStorytellerId,
  selectToastIdRef,
  selectUserCredentials,
} from "redux/selectors.js";

import {
  LOBBY,
  GUESSING,
  VOTING,
  ROUND_RESULTS,
} from "utils/generals/constants.js";
import Button from "common/components/ui/Button";
import Mask from "../Mask/Mask.jsx";

import css from "./Hand.module.scss";
import { useTellStory } from "hooks/useTellStory.js";
import { useGuess } from "hooks/useGuess.js";
import { Notify } from "notiflix";
import {
  setSelectedCardId,
  removeSelectedCardId,
  setIsShowMask,
  setIsCarouselModeHandScreen,
  removeToastIdRef,
} from "redux/game/localPersonalSlice.js";
import { useStartNewRound } from "hooks/useStartNewRound.js";

export default function Hand({
  isActiveScreen,
  setMiddleButton,
  startVoting,
  finishRound,
  isZoomed,
  setIsZoomed,
}) {
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(gameId));

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, playerId));
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));
  useEffect(() => {
    console.log("isShowMask :>> ", isShowMask);
  }, [isShowMask]);
  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));
  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );
  const toastIdRef = useSelector(selectToastIdRef(gameId));

  // const [selectedCardId, setSelectedCardId] = useState(null); // for first story(teller) mode
  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card
  const [cardsSet, setCardsSet] = useState({
    firstGuessCardSet: null,
    secondGuessCardSet: null,
  });
  const [isMountedCarousel, setIsMountedCarousel] = useState(false); // is mounted carousel for zooming (in next version)

  const { firstGuessCardSet, secondGuessCardSet } = cardsSet;
  const currentPlayer = gamePlayers.find(p => p._id === playerId);
  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const playersMoreThanThree = gamePlayers.length > 3;
  // const playersMoreThanSix = gamePlayers.length > 6;
  const isStartVotingDisabled = gamePlayers.some(player => !player.isGuessed);

  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);

  const isCurrentPlayerHost = hostPlayerId === playerId;

  // const isCanGuess = useCallback(() => {
  //   if ((playersMoreThanSix && !isSingleCardMode) || !playersMoreThanThree) {
  //     return !!firstGuessCardSet?._id && !!secondGuessCardSet?._id;
  //   } else return !!firstGuessCardSet?._id;
  // }, [
  //   firstGuessCardSet?._id,
  //   isSingleCardMode,
  //   playersMoreThanSix,
  //   playersMoreThanThree,
  //   secondGuessCardSet?._id,
  // ]);

  const isCanGuess = useCallback(() => {
    if (!playersMoreThanThree) {
      return !!firstGuessCardSet?._id && !!secondGuessCardSet?._id;
    } else return !!firstGuessCardSet?._id;
  }, [firstGuessCardSet?._id, playersMoreThanThree, secondGuessCardSet?._id]);

  const isCurrentPlayerGuessed = gamePlayers.some(
    player => player._id === playerId && player.isGuessed,
  );

  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller?.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  const tellStory = useTellStory(gameId);
  const guessStory = useGuess(gameId, cardsSet);
  const startNewRound = useStartNewRound(gameId);

  const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeHandScreen && !isZoomed,
  });

  const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
  const currentCard = playerHand[currentCardIndex];

  const handleStory = useCallback(() => {
    console.log("handleStory");
    gameStatus === GUESSING ? guessStory() : tellStory();

    setCardsSet({ firstGuessCardSet: null, secondGuessCardSet: null }); // не обов'язково
    dispatch(removeSelectedCardId({ gameId, playerId })); // clear
  }, [dispatch, gameId, gameStatus, guessStory, playerId, tellStory]);

  const returnToHand = useCallback(() => {
    console.log("returnToHand");
    const updatedGame = { ...currentGame, isFirstTurn: false };
    dispatch(setIsShowMask({ gameId, playerId, isShow: false }));

    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    dispatch(removeSelectedCardId({ gameId, playerId })); // clear

    toast.dismiss(toastIdRef); // Закриє відповідне повідомлення
    dispatch(removeToastIdRef({ gameId, playerId }));
  }, [currentGame, dispatch, gameId, playerId, toastIdRef]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);

    dispatch(
      setIsCarouselModeHandScreen({
        gameId,
        playerId,
        isCarouselModeHandScreen: true,
      }),
    );

    setActiveCardIdx(idx);
    setIsMountedCarousel(true);
  };

  const exitCarouselMode = useCallback(() => {
    dispatch(
      setIsCarouselModeHandScreen({
        gameId,
        playerId,
        isCarouselModeHandScreen: false,
      }),
    );
    setIsMountedCarousel(false);
    // setMiddleButton(null);
  }, [dispatch, gameId, playerId]);

  const toggleCardSelection = useCallback(
    btnKey => {
      if (isSingleCardMode && btnKey === "secondGuessCardSet") {
        console.log("error: only one card allowed");
        Notify.failure("error: only one card allowed");
        return;
      }

      // const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
      // const currentCard = playerHand[currentCardIndex];

      if (!currentCard) {
        console.log("error: card not found");
        Notify.failure("error: card not found");
        return;
      }

      if (gameStatus === GUESSING) {
        console.log("gameStatus === GUESSING");
        // Встановлення локального стану карток:
        setCardsSet(prev => {
          const isSelected =
            prev.firstGuessCardSet?._id === currentCard._id ||
            prev.secondGuessCardSet?._id === currentCard._id;

          if (isSelected && prev[btnKey]?._id === currentCard._id)
            return { ...prev, [btnKey]: null };

          const otherCard =
            btnKey === "firstGuessCardSet"
              ? prev.secondGuessCardSet
              : prev.firstGuessCardSet;

          // Якщо картки не обрані
          if (!prev.firstGuessCardSet || !prev.secondGuessCardSet) {
            // Коли гравців троє, то в комірках мають бути різні карти:
            if (!playersMoreThanThree && otherCard?._id === currentCard._id) {
              Notify.failure("error: cards must be different");
              console.log("error: cards must be different");
              return prev;
            }

            return { ...prev, [btnKey]: currentCard };
          }

          return prev; // Якщо обидва слоти зайняті іншими картами
        });
      } else if (gameStatus === LOBBY) {
        if (currentCard._id === selectedCardId) {
          dispatch(removeSelectedCardId({ gameId, playerId })); // clear
        } else {
          dispatch(
            setSelectedCardId({
              gameId,
              playerId,
              selectedCardId: currentCard._id,
            }),
          );
        }

        // onSelectCard(currentCard._id);
      }
    },
    [
      currentCard,
      dispatch,
      gameId,
      gameStatus,
      isSingleCardMode,
      playerId,
      playersMoreThanThree,
      selectedCardId,
    ],
  );

  //~ is show mask
  useEffect(() => {
    if (isShowMask) {
      dispatch(
        setIsCarouselModeHandScreen({
          gameId,
          playerId,
          isCarouselModeHandScreen: false,
        }),
      );

      console.log(" useEffect >> isShowMask:::", isShowMask);
    }
  }, [dispatch, gameId, isShowMask, playerId]);

  //~ reInit for emblaApiCardsGuess
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    emblaApiCardsGuess.reInit({
      watchDrag: isCarouselModeHandScreen && !isZoomed,
    });
  }, [emblaApiCardsGuess, isCarouselModeHandScreen, isZoomed]);

  // // ??
  // useEffect(() => {
  //   if (gameStatus === GUESSING) dispatch(removeSelectedCardId({ gameId, playerId })); // todo перевірити чи потрібно ще?
  // }, [dispatch, gameId, gameStatus, playerId]);

  //~ Get active card's index
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    const onSelect = () =>
      setActiveCardIdx(emblaApiCardsGuess.selectedScrollSnap());
    emblaApiCardsGuess.on("select", onSelect); // Підписка на подію зміни слайда

    return () => emblaApiCardsGuess.off("select", onSelect);
  }, [emblaApiCardsGuess]);

  //~ KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApiCardsGuess) return;
      if (event.key === "ArrowLeft") emblaApiCardsGuess.scrollPrev();
      else if (event.key === "ArrowRight") emblaApiCardsGuess.scrollNext();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApiCardsGuess]);

  //* setMiddleButton
  useEffect(() => {
    if (!isActiveScreen) return;

    if (isCarouselModeHandScreen) {
      console.log("Carousel Mode");
      const activeCard = playerHand[activeCardIdx];
      if (!activeCard) {
        console.log("error: card not found");
        Notify.failure("error: card not found");
        return;
      }

      const isDisabledFirstBtn = () => {
        if (gameStatus === LOBBY)
          return selectedCardId && selectedCardId !== currentCard._id;

        if (gameStatus === GUESSING) {
          if (playersMoreThanThree)
            return (
              firstGuessCardSet && firstGuessCardSet._id !== activeCard._id
            );
          else
            return (
              (firstGuessCardSet && firstGuessCardSet._id !== activeCard._id) ||
              (!firstGuessCardSet &&
                secondGuessCardSet &&
                secondGuessCardSet._id === activeCard._id)
            );
        }
      };

      const isDisabledSecondBtn = () => {
        return playersMoreThanThree
          ? secondGuessCardSet && secondGuessCardSet._id !== activeCard._id
          : (secondGuessCardSet && secondGuessCardSet._id !== activeCard._id) ||
              (!secondGuessCardSet &&
                firstGuessCardSet &&
                firstGuessCardSet._id === activeCard._id);
      };

      setMiddleButton(
        <>
          <Button btnText="<<" onClick={exitCarouselMode} />

          {!storytellerId ||
          (!isCurrentPlayerStoryteller && storyteller?.isGuessed) ? (
            <>
              <Button
                btnText={gameStatus === LOBBY ? "Select card" : "Choose card"}
                onClick={() => toggleCardSelection("firstGuessCardSet")}
                disabled={isDisabledFirstBtn() || isCurrentPlayerGuessed}
                btnStyle={["btnFlexGrow"]}
                localClassName={
                  (firstGuessCardSet || selectedCardId) && css.btnActive
                }
              />
              {/* 
              {!playersMoreThanThree && (
                <Button
                  btnText={gameStatus === LOBBY ? "Select card" : "Choose card"}
                  onClick={() => toggleCardSelection("secondGuessCardSet")}
                  disabled={isDisabledSecondBtn() || isCurrentPlayerGuessed}
                  localClassName={secondGuessCardSet && css.btnActive}>
                </Button>
              )} */}

              {!playersMoreThanThree &&
                (gameStatus === LOBBY ? (
                  ""
                ) : (
                  <Button
                    btnText={"Choose card"}
                    onClick={() => toggleCardSelection("secondGuessCardSet")}
                    disabled={isDisabledSecondBtn() || isCurrentPlayerGuessed}
                    localClassName={secondGuessCardSet && css.btnActive}
                  />
                ))}
            </>
          ) : (
            isCurrentPlayerStoryteller &&
            !currentPlayer.isGuessed && (
              <>
                <Button
                  btnText={"Select card"}
                  onClick={() => toggleCardSelection("firstGuessCardSet")}
                  disabled={isDisabledFirstBtn() || isCurrentPlayerGuessed}
                  btnStyle={["btnFlexGrow"]}
                  localClassName={
                    (firstGuessCardSet || selectedCardId) && css.btnActive
                  }></Button>
              </>
            )
          )}
        </>,
      );
    } else {
      console.log("Non Carousel Mode");
      setMiddleButton(null); // обнуляю кнопку для усіх при старті нового раунду

      if (isShowMask) {
        console.log("isShowMask");
        if (isCurrentPlayerStoryteller) {
          console.log("returnToHand() for isCurrentPlayerStoryteller ");
          returnToHand(); // для сторітеллера екран-маска автоматично закривається
        } else {
          console.log("set Mask for other players");
          // Для інших гравців показується екран-маска, та кнопка закриття маски:
          setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={"Go to guess the story"}
              onClick={returnToHand}
            />,
          );
        }
      }
      // else if (isCurrentPlayerHost && gameStatus === LOBBY) {
      //   console.log("це хост і почався новий раунд (LOBBY)");
      //   setMiddleButton(null);
      // }
      else if (
        isCurrentPlayerHost &&
        isReadyToVote &&
        gameStatus === GUESSING
      ) {
        console.log("це хост і всі обрали карти - готові до голосування");
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Start voting"}
            onClick={startVoting}
            disabled={isStartVotingDisabled}
          />,
        );
      } else if (
        isCurrentPlayerHost &&
        isReadyToCalculatePoints &&
        gameStatus === VOTING
      ) {
        console.log("це хост і всі проголосували - можна рахувати бали");
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Finish round"}
            onClick={finishRound}
          />,
        );
      } else if (isCurrentPlayerHost && gameStatus === ROUND_RESULTS) {
        console.log("це хост і можна починати новий раунд");
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Start new round"}
            onClick={startNewRound}
          />,
        );
      } else {
        if (isCurrentPlayerStoryteller && gameStatus === !LOBBY) {
          console.log("встановлюю кнопку в нуль для сторітелера");
          setMiddleButton(null);
        } else {
          if (gameStatus === LOBBY) {
            console.log(
              "блок для gameStatus LOBBY - встановити кнопку tell your story",
            );
            if (
              !storytellerId ||
              (storytellerId && isCurrentPlayerStoryteller)
            ) {
              setMiddleButton(
                <Button
                  btnStyle={["btnFlexGrow"]}
                  btnText={"Tell your story"}
                  onClick={handleStory}
                  disabled={!selectedCardId}
                />,
              );
            }
          } else if (gameStatus === GUESSING) {
            console.log("блок для gameStatus GUESSING");

            if (!isCurrentPlayerGuessed) {
              console.log("GUESSING player not guessed");
              setMiddleButton(
                <Button
                  btnStyle={["btnFlexGrow"]}
                  btnText={"Guess story"}
                  onClick={handleStory}
                  disabled={!isCanGuess() || isCurrentPlayerGuessed}
                />,
              );
            } else {
              setMiddleButton(null);
            }
          } else setMiddleButton(null);
        }
      }
    }
  }, [
    activeCardIdx,
    currentCard._id,
    currentPlayer.isGuessed,
    exitCarouselMode,
    finishRound,
    firstGuessCardSet,
    gameStatus,
    handleStory,
    isActiveScreen,
    isCanGuess,
    isCarouselModeHandScreen,
    isCurrentPlayerGuessed,
    isCurrentPlayerHost,
    isCurrentPlayerStoryteller,
    isReadyToCalculatePoints,
    isReadyToVote,
    isShowMask,
    isStartVotingDisabled,
    playerHand,
    playersMoreThanThree,
    returnToHand,
    secondGuessCardSet,
    selectedCardId,
    setMiddleButton,
    startNewRound,
    startVoting,
    storyteller?.isGuessed,
    storytellerId,
    toggleCardSelection,
  ]);

  // Set star(s) to card(s):
  const getStarsMarksByCardId = cardId => {
    const marks = [];

    if (gameStatus === LOBBY) {
      if (selectedCardId === cardId) {
        marks.push(
          <MdCheck className={css.checkboxCard} style={{ color: "white" }} />,
        );
      }
    } else {
      if (firstGuessCardSet?._id === cardId)
        marks.push(<MdCheck className={css.checkboxCard} />);
      if (secondGuessCardSet?._id === cardId)
        marks.push(<MdCheck className={css.checkboxCard} />);
    }

    return marks;
  };

  // for zooming in next version
  // const Controls = ({ zoomIn, zoomOut, resetTransform }) => (
  //   <>
  //     <button onClick={() => zoomIn()}>+</button>
  //     <button onClick={() => zoomOut()}>-</button>
  //     <button onClick={() => resetTransform()}>x</button>
  //   </>
  // );

  // ^Render
  if (!isCurrentPlayerStoryteller && isShowMask) {
    return (
      <>
        <div className={css.maskContainer}>
          <Mask />
        </div>
      </>
    );
  }

  return (
    <>
      <p>Hand</p>
      <p>{paragraphText}</p>

      {isCarouselModeHandScreen ? (
        <div className={css.carouselWrapper} ref={emblaRefCardsGuess}>
          <ul className={css.carouselContainer}>
            {playerHand.map(card => {
              const marks = getStarsMarksByCardId(card._id);

              return (
                <li className={css.carouselSlide} key={card._id}>
                  <div className={css.slideContainer}>
                    {marks.length > 0 && (
                      <div className={css.checkboxContainer}>
                        {marks.map((mark, index) => (
                          <span key={index} className={css.checkboxCard}>
                            {mark}
                          </span>
                        ))}
                      </div>
                    )}

                    <img
                      className={`${css.carouselImage} ${css.visible}`}
                      src={card.url}
                      alt="enlarged card"
                    />

                    {/* <img
                      className={`${css.carouselImage} ${
                        isMountedCarousel ? css.visible : ""
                      }`}
                      src={card.url}
                      alt="enlarged card"
                    /> */}

                    {/* // todo add zoom by modal window
                     <TransformWrapper
                      maxScale={5}
                      panning={{ velocityDisabled: true, disabled: !isZoomed }}
                      onTransformed={({ state }) =>
                        setIsZoomed(state.scale > 1)
                      }>
                      {({ zoomIn, zoomOut, resetTransform, ...rest }) => {
                        return (
                          <div className={css.zoomCardWrapper}>
                            {isZoomed && (
                              <div className={css.zoomTools}>
                                <button onClick={() => zoomIn()}>+</button>
                                <button onClick={() => zoomOut()}>-</button>
                                <button onClick={() => resetTransform()}>
                                  x
                                </button>
                              </div>
                            )}
                            <TransformComponent>
                              <img
                                className={`${css.carouselImage} ${
                                  isMountedCarousel ? css.visible : ""
                                }`}
                                src={card.url}
                                alt="enlarged card"
                              />
                            </TransformComponent>
                          </div>
                        );
                      }}
                    </TransformWrapper> */}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className={css.currentDeckContainer}>
          <ul className={`${css.currentDeck}`}>
            {currentPlayer.hand.map((card, idx) => {
              const marks = getStarsMarksByCardId(card._id);

              return (
                <li
                  className={css.card}
                  key={card._id}
                  onClick={() => carouselModeOn(idx)}>
                  {marks.length > 0 && (
                    <div className={css.checkboxContainerList}>
                      {getStarsMarksByCardId(card._id).map((mark, index) => (
                        <span key={index} className={css.checkboxCard}>
                          {mark}
                        </span>
                      ))}
                    </div>
                  )}
                  <img className={css.img} src={card.url} alt="card" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
