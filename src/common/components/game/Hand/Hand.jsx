import { MdOutlineStarOutline, MdOutlineStar, MdCheck } from "react-icons/md";

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
  selectIsShowMask,
  selectIsSingleCardMode,
  selectPlayerHand,
  selectSelectedCardId,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";

import {
  LOBBY,
  GUESSING,
  ROUND_RESULTS,
  VOTING,
} from "utils/generals/constants.js";
import Button from "common/components/ui/Button";
import Mask from "../Mask/Mask.jsx";

import css from "./Hand.module.scss";
import { useTellStory } from "hooks/useTellStory.js";
import { useGuess } from "hooks/useGuess.js";
import { Notify } from "notiflix";
import { setSelectedCardId } from "redux/game/localPersonalSlice.js";

export default function Hand({
  isActiveScreen,
  setMiddleButton,
  isCarouselModeHandScreen,
  setIsCarouselModeHandScreen,
  startVoting,
  finishRound,
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
  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));

  // const [selectedCardId, setSelectedCardId] = useState(null); // for first story(teller) mode
  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card
  const [cardsSet, setCardsSet] = useState({
    firstGuessCardSet: null,
    secondGuessCardSet: null,
  });
  const [isMountedCarousel, setIsMountedCarousel] = useState(false); // is mounted carousel

  const { firstGuessCardSet, secondGuessCardSet } = cardsSet;
  const currentPlayer = gamePlayers.find(p => p._id === playerId);
  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const playersMoreThanThree = gamePlayers.length > 3;
  const playersMoreThanSix = gamePlayers.length > 6;
  const isStartVotingDisabled = gamePlayers.some(player => !player.isGuessed);

  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);
  // const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  // const isReadyToVote = gamePlayers.every(player => player.isGuessed);
  // const isCanGuess =
  //   playersMoreThanThree
  //     ? !!firstGuessCardSet?._id
  //     : !!firstGuessCardSet?._id && !!secondGuessCardSet?._id;

  const isCanGuess =
    playersMoreThanSix && !isSingleCardMode
      ? !!firstGuessCardSet?._id && !!secondGuessCardSet?._id
      : !!firstGuessCardSet?._id;

  const isCurrentPlayerGuessed = gamePlayers.some(
    player => player._id === playerId && player.isGuessed,
  );

  const isCurrentPlayerHost = hostPlayerId === playerId;

  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  // const tellStory = useTellStory(gameId, selectedCardId);
  const tellStory = useTellStory(gameId);
  const guessStory = useGuess(gameId, cardsSet);
  const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeHandScreen,
  });

  const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
  const currentCard = playerHand[currentCardIndex];

  const handleStory = useCallback(() => {
    console.log("handleStory");
    gameStatus === GUESSING ? guessStory() : tellStory();

    setCardsSet({ firstGuessCardSet: null, secondGuessCardSet: null }); // не обов'язково
    // dispatch(setSelectedCardId(null)); // clear
  }, [gameStatus, guessStory, tellStory]);

  // const onSelectCard = useCallback(
  //   cardId =>
  //     dispatch(setSelectedCardId(cardId === selectedCardId ? null : cardId)),
  //   [dispatch, selectedCardId],
  // );

  const returnToHand = useCallback(() => {
    const updatedGame = { ...currentGame, isFirstTurn: false };

    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    // dispatch(setSelectedCardId(null));
  }, [currentGame]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);
    setIsCarouselModeHandScreen(true);
    setActiveCardIdx(idx);
    setIsMountedCarousel(true);
  };

  const exitCarouselMode = useCallback(() => {
    setIsMountedCarousel(false);
    setIsCarouselModeHandScreen(false);
    setMiddleButton(null);
  }, [setIsCarouselModeHandScreen, setMiddleButton]);

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
        dispatch(
          setSelectedCardId({
            gameId,
            playerId,
            selectedCardId:
              currentCard._id === selectedCardId ? null : currentCard._id,
          }),
        );

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

  // reInit for emblaApiCardsGuess
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    emblaApiCardsGuess.reInit({
      watchDrag: isCarouselModeHandScreen,
    });
  }, [emblaApiCardsGuess, isCarouselModeHandScreen]);

  // // ??
  // useEffect(() => {
  //   if (gameStatus === GUESSING) dispatch(setSelectedCardId(null)); // todo перевірити чи потрібно ще?
  // }, [dispatch, gameStatus]);

  // Get active card's index
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    const onSelect = () =>
      setActiveCardIdx(emblaApiCardsGuess.selectedScrollSnap());
    emblaApiCardsGuess.on("select", onSelect); // Підписка на подію зміни слайда

    return () => emblaApiCardsGuess.off("select", onSelect);
  }, [emblaApiCardsGuess]);

  // KB events handler
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
      console.log("it is isCarouselModeHandScreen");
      const activeCard = playerHand[activeCardIdx];
      if (!activeCard) {
        console.log("error: card not found");
        return;
      }

      const isDisabledFirstBtn = () => {
        if (gameStatus === LOBBY) {
          // const currentCardIndex =
          //   emblaApiCardsGuess?.selectedScrollSnap() || 0;
          // const currentCard = playerHand[currentCardIndex];

          return selectedCardId && selectedCardId !== currentCard._id;
        }

        if (gameStatus === GUESSING) {
          if (playersMoreThanThree) {
            return (
              firstGuessCardSet && firstGuessCardSet._id !== activeCard._id
            );
          } else
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

      if (gameStatus === LOBBY) {
      } else if (gameStatus === GUESSING) {
      }
      setMiddleButton(
        <>
          <Button btnText="<" onClick={exitCarouselMode} />

          <div style={{ display: "flex", flexDirection: "row" }}>
            {!isCurrentPlayerStoryteller && (
              <>
                <Button
                  onClick={() => toggleCardSelection("firstGuessCardSet")}
                  disabled={isDisabledFirstBtn() || isCurrentPlayerGuessed}
                  localClassName={
                    (firstGuessCardSet || selectedCardId) && css.btnActive
                  }>
                  {gameStatus === LOBBY ? (
                    <MdCheck style={{ width: "20px", height: "20px" }} />
                  ) : (
                    <MdOutlineStarOutline
                      style={{ width: "20px", height: "20px" }}
                    />
                  )}
                </Button>

                {!playersMoreThanThree && (
                  <Button
                    onClick={() => toggleCardSelection("secondGuessCardSet")}
                    disabled={isDisabledSecondBtn() || isCurrentPlayerGuessed}
                    localClassName={secondGuessCardSet && css.btnActive}>
                    <MdOutlineStarOutline
                      style={{ width: "20px", height: "20px" }}
                    />
                  </Button>
                )}
              </>
            )}
          </div>
        </>,
      );
    } else if (isShowMask) {
      console.log("it is isShowMask");
      // Логіка якщо це не карусель-режим і одразу після першого ходу, то треба показати екран-маску:
      isCurrentPlayerStoryteller
        ? returnToHand() // для сторітеллера екран-маска автоматично закривається
        : // Для інших гравців показується екран-маска, та кнопка закриття маски:
          setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={"Close mask"}
              onClick={returnToHand}
            />,
          );
    } else if (isCurrentPlayerStoryteller && !isCurrentPlayerHost) {
      console.log(
        "it is storyteller and he is not host: isCurrentPlayerStoryteller && !isCurrentPlayerHost",
      );
      // Якщо це сторітеллер
      setMiddleButton(null); // Очищаємо кнопку для сторітеллера, бо він карту вже скинув
    } else if (gameStatus === LOBBY) {
      console.log("this is gameStatus === LOBBY");
      // if (!isCurrentPlayerStoryteller) {
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText={"Tell your story"}
          onClick={handleStory}
          disabled={!selectedCardId}
        />,
      );
      // }
    } else if (gameStatus === GUESSING) {
      console.log("this is gameStatus === GUESSING");
      // Якщо це не карусель, але вже і не перший хід (закрита екран-маска)
      if (isCurrentPlayerHost && isReadyToVote) {
        // Якщо це ведучий:
        console.log(
          "this is gameStatus === GUESSING and current player is host and all players guessed",
        );
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Start voting"}
            onClick={startVoting}
            disabled={isStartVotingDisabled}
          />,
        );
      }
      // Якщо це не сторітеллер, то вгадують (скидують) карту (чи дві, якщо гравців троє)
      // if (!isCurrentPlayerStoryteller) {
      else if (!isCurrentPlayerGuessed) {
        console.log("payer still not guessed when gameStatus === GUESSING");
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Guess story"}
            onClick={handleStory}
            disabled={!isCanGuess || isCurrentPlayerGuessed}
          />,
        );
      } else {
        console.log(
          "this is gameStatus === GUESSING, and player already guessed ",
        );
        setMiddleButton(null);
      }
      // }
    } else if (gameStatus === VOTING) {
      console.log("it is gameStatus === VOTING");
      if (isCurrentPlayerHost && isReadyToCalculatePoints) {
        console.log(
          "it is gameStatus === VOTING and current player is host and all players already voted",
        );
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Finish round"}
            onClick={finishRound}
          />,
        );
      }
    } else {
      console.log("set middle btn to null");
      setMiddleButton(null);
    }
  }, [
    activeCardIdx,
    currentCard._id,
    emblaApiCardsGuess,
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
    startVoting,
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
        marks.push(<MdOutlineStarOutline className={css.checkboxCard} />);
      if (secondGuessCardSet?._id === cardId)
        marks.push(<MdOutlineStarOutline className={css.checkboxCard} />);
    }

    return marks;
  };

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

  if (ROUND_RESULTS) {
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
              console.log(" marks:::", marks);

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
                      className={`${css.carouselImage} ${
                        isMountedCarousel ? css.visible : ""
                      }`}
                      src={card.url}
                      alt="card"
                    />
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
