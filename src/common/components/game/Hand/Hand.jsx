import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import socket from "services/socket.js";

import {
  selectGame,
  selectGamePlayers,
  selectGameStatus,
  selectHostPlayerId,
  selectIsFirstTurn,
  selectIsSingleCardMode,
  selectPlayerHand,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";

import { LOBBY, VOTING } from "utils/generals/constants.js";
import Button from "common/components/ui/Button";
import Mask from "../Mask/Mask.jsx";

import css from "./Hand.module.scss";
import { useTellStory } from "hooks/useTellStory.js";
import { useGuess } from "hooks/useGuess.js";

export default function Hand({
  isActiveScreen,
  setMiddleButton,
  isCarouselModeHandScreen,
  setIsCarouselModeHandScreen,
  calculateRoundPoints,
}) {
  const { gameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(gameId));
  const isFirstTurn = useSelector(selectIsFirstTurn(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const [selectedCardId, setSelectedCardId] = useState(null); // for first story(teller) mode
  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card
  const [cardsSet, setCardsSet] = useState({
    firstCard: null,
    secondCard: null,
  });
  const [isMountedCarousel, setIsMountedCarousel] = useState(false); // is mounted carousel

  const { firstCard, secondCard } = cardsSet;
  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);
  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;
  const playersMoreThanThree = gamePlayers.length > 3;
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);
  // const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  // const isReadyToVote = gamePlayers.every(player => player.isGuessed);
  const isCanGuess =
    playersMoreThanThree && isSingleCardMode
      ? !!firstCard?._id
      : !!firstCard?._id && !!secondCard?._id;
  const isCurrentPlayerGuessed = gamePlayers.some(
    player => player._id === userCredentials._id && player.isGuessed,
  );
  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  const tellStory = useTellStory(gameId, selectedCardId);
  const guessStory = useGuess(cardsSet, gameId);
  const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeHandScreen,
  });

  const onSelectCard = cardId =>
    setSelectedCardId(cardId === selectedCardId ? null : cardId);

  const returnToHand = useCallback(() => {
    const updatedGame = { ...currentGame, isFirstTurn: false };
    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    setSelectedCardId(null);
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
      if (isSingleCardMode && btnKey === "secondCard") {
        console.log("error: only one card allowed");
        return;
      }

      const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
      const currentCard = playerHand[currentCardIndex];

      if (!currentCard) {
        console.log("error: card not found");
        return;
      }

      setCardsSet(prev => {
        const isSelected =
          prev.firstCard?._id === currentCard._id ||
          prev.secondCard?._id === currentCard._id;

        if (isSelected && prev[btnKey]?._id === currentCard._id)
          return { ...prev, [btnKey]: null };

        const otherCard =
          btnKey === "firstCard" ? prev.secondCard : prev.firstCard;

        if (!prev.firstCard || !prev.secondCard) {
          if (!playersMoreThanThree && otherCard?._id === currentCard._id) {
            console.log("error: cards must be different");
            return prev;
          }

          return { ...prev, [btnKey]: currentCard };
        }

        return prev; // Якщо обидва слоти зайняті іншими картами
      });
    },
    [emblaApiCardsGuess, isSingleCardMode, playerHand, playersMoreThanThree],
  );

  // Set star(s) to card(s):
  const getStarMarks = cardId => {
    const marks = [];
    if (firstCard?._id === cardId) marks.push("★1");
    if (secondCard?._id === cardId) marks.push("★2");
    return marks;
  };

  const handleStory = useCallback(() => {
    console.log("handleStory");
    gameStatus === VOTING ? guessStory() : tellStory();
    setCardsSet({ firstCard: null, secondCard: null }); // не обов'язково
    setSelectedCardId(null); // clear
  }, [gameStatus, guessStory, tellStory]);

  // reInit for emblaApiCardsGuess
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    emblaApiCardsGuess.reInit({
      watchDrag: isCarouselModeHandScreen,
    });
  }, [emblaApiCardsGuess, isCarouselModeHandScreen]);

  // ??
  useEffect(() => {
    if (gameStatus === VOTING) setSelectedCardId(null); // todo перевірити чи потрібно ще?
  }, [gameStatus]);

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

  // setMiddleButton
  useEffect(() => {
    if (!isActiveScreen) return;

    if (isCarouselModeHandScreen) {
      const activeCard = playerHand[activeCardIdx];
      if (!activeCard) {
        console.log("error: card not found");
        return;
      }

      const isDisabledFirstBtn = playersMoreThanThree
        ? firstCard && firstCard._id !== activeCard._id
        : (firstCard && firstCard._id !== activeCard._id) ||
          (!firstCard && secondCard && secondCard._id === activeCard._id);

      const isDisabledSecondBtn = playersMoreThanThree
        ? secondCard && secondCard._id !== activeCard._id
        : (secondCard && secondCard._id !== activeCard._id) ||
          (!secondCard && firstCard && firstCard._id === activeCard._id);

      setMiddleButton(
        <>
          <Button btnText="Back" onClick={exitCarouselMode} />

          <div style={{ display: "flex", flexDirection: "row" }}>
            {!isCurrentPlayerStoryteller && (
              <>
                <Button
                  btnText="★1"
                  onClick={() => toggleCardSelection("firstCard")}
                  disabled={isDisabledFirstBtn || isCurrentPlayerGuessed}
                  localClassName={cardsSet.firstCard && css.btnActive}
                />
                {!isSingleCardMode && (
                  <Button
                    btnText="★2"
                    onClick={() => toggleCardSelection("secondCard")}
                    disabled={isDisabledSecondBtn || isCurrentPlayerGuessed}
                    localClassName={cardsSet.secondCard && css.btnActive}
                  />
                )}
              </>
            )}
          </div>
        </>,
      );
    } else if (isFirstTurn) {
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
    } else {
      // Логіка якщо це не карусель, але вже і не перший хід (закрита екран-маска)
      if (hostPlayerId === userCredentials._id && isReadyToCalculatePoints) {
        // Якщо це ведучий і всі проголосували можна закінчувати раунд:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Finish round"}
            onClick={calculateRoundPoints}
          />,
        );
      } else if (isCurrentPlayerStoryteller) {
        // Якщо це сторітеллер
        setMiddleButton(null); // Очищаємо кнопку для сторітеллера, бо він карту вже скинув
      }
      // Якщо це не сторітеллер, то вгадують (скидують) карту (чи дві, якщо гравців троє)
      else {
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={!storytellerId ? "Tell your story" : "Guess story"}
            onClick={handleStory}
            disabled={
              (gameStatus === LOBBY && !selectedCardId) ||
              (gameStatus === VOTING && (!isCanGuess || isCurrentPlayerGuessed))
            }
          />,
        );
      }
    }
  }, [
    activeCardIdx,
    calculateRoundPoints,
    cardsSet.firstCard,
    cardsSet.secondCard,
    exitCarouselMode,
    firstCard,
    gameStatus,
    handleStory,
    hostPlayerId,
    isActiveScreen,
    isCanGuess,
    isCarouselModeHandScreen,
    isCurrentPlayerGuessed,
    isCurrentPlayerStoryteller,
    isFirstTurn,
    isReadyToCalculatePoints,
    isSingleCardMode,
    playerHand,
    playersMoreThanThree,
    returnToHand,
    secondCard,
    selectedCardId,
    setMiddleButton,
    storytellerId,
    toggleCardSelection,
    userCredentials._id,
  ]);

  // ^Render
  if (isFirstTurn && !isCurrentPlayerStoryteller) {
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
            {playerHand.map(card => (
              <li className={css.carouselSlide} key={card._id}>
                <img
                  src={card.url}
                  alt="card"
                  // className={css.carouselImage}
                  className={`${css.carouselImage} ${
                    isMountedCarousel ? css.visible : ""
                  }`}
                />
                <div className={css.checkboxContainer}>
                  {getStarMarks(card._id).map((mark, index) => (
                    <span key={index} className={css.checkboxCarousel}>
                      {mark}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <ul className={`${css.currentDeck}`}>
            {currentPlayer.hand.map((card, idx) => (
              <li
                className={css.card}
                key={card._id}
                onClick={
                  gameStatus === VOTING
                    ? () => carouselModeOn(idx)
                    : () => onSelectCard(card._id)
                }>
                <img
                  className={`${css.img} ${
                    selectedCardId &&
                    selectedCardId !== card._id &&
                    css.imgInactive
                  }`}
                  src={card.url}
                  alt="card"
                />
                <div className={css.checkboxContainer}>
                  {getStarMarks(card._id).map((mark, index) => (
                    <span key={index} className={css.checkboxCard}>
                      {mark}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
