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
  isCarouselModeTableScreen,
}) {
  const { gameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(gameId));
  const isFirstTurn = useSelector(selectIsFirstTurn(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));

  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);
  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));

  const playersMoreThanThree = gamePlayers.length > 3;
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    if (gameStatus === VOTING) setSelectedCardId(null);
  }, [gameStatus]);

  const onSelectCard = cardId =>
    setSelectedCardId(cardId === selectedCardId ? null : cardId);

  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

  const [cardsSet, setCardsSet] = useState({
    firstCard: null,
    secondCard: null,
  });
  const { firstCard, secondCard } = cardsSet;

  const tellStory = useTellStory(gameId, selectedCardId);
  const guessStory = useGuess(cardsSet, gameId);

  const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
  });

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

  const exitCarouselMode = useCallback(() => {
    setIsCarouselModeHandScreen(false);
    setMiddleButton(null);
  }, [setIsCarouselModeHandScreen, setMiddleButton]);

  const returnToHand = useCallback(() => {
    const updatedGame = { ...currentGame, isFirstTurn: false };
    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    setSelectedCardId(null);
  }, [currentGame]);

  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  const handleStory = useCallback(() => {
    gameStatus === VOTING ? guessStory() : tellStory();
    setCardsSet({ firstCard: null, secondCard: null }); // не обов'язково
    setSelectedCardId(null); // clear
  }, [gameStatus, guessStory, tellStory]);

  const isCanGuess =
    playersMoreThanThree && isSingleCardMode
      ? !!firstCard?._id
      : !!firstCard?._id && !!secondCard?._id;

  const isCurrentPlayerGuessed = gamePlayers.some(
    player => player._id === userCredentials._id && player.isGuessed,
  );

  // Get active card's index
  useEffect(() => {
    if (!emblaApiCardsGuess) return; // Перевірка на наявність API
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
      // Якщо це не карусель-режим і одразу після першого ходу, то треба показати екран-маску:
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
      // Якщо це не карусель-режим і закритий екран-маска (хтось вже став сторітеллером)
      if (isCurrentPlayerStoryteller) {
        setMiddleButton(null); // Очищаємо кнопку для сторітеллера, бо він карту вже скинув
      }
      // Інші гравці скидають карту (чи дві, якщо гравців троє)
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

    // const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
    const isReadyToVote = gamePlayers.every(player => player.isGuessed);
    // Якщо це ведучий:
    if (hostPlayerId === userCredentials._id && isReadyToVote) {
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText={"Finish round"}
          onClick={calculateRoundPoints}
        />,
      );
    }
  }, [
    activeCardIdx,
    cardsSet.firstCard,
    cardsSet.secondCard,
    exitCarouselMode,
    firstCard,
    gamePlayers,
    gameStatus,
    handleStory,
    hostPlayerId,
    isActiveScreen,
    isCanGuess,
    isCarouselModeHandScreen,
    isCurrentPlayerStoryteller,
    isCurrentPlayerGuessed,
    isFirstTurn,
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
    calculateRoundPoints,
  ]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);
    setIsCarouselModeHandScreen(true);
    setActiveCardIdx(idx);
  };

  // Set star(s) to card(s):
  const getStarMarks = cardId => {
    const marks = [];
    if (firstCard?._id === cardId) marks.push("★1");
    if (secondCard?._id === cardId) marks.push("★2");
    return marks;
  };

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
        <div
          className={css.carouselWrapper}
          ref={emblaRefCardsGuess}
          // ref={isCarouselModeTableScreen ? null : emblaRefCardsGuess}
        >
          <ul className={css.carouselContainer}>
            {playerHand.map(card => (
              <li className={css.carouselSlide} key={card._id}>
                <img src={card.url} alt="card" className={css.carouselImage} />
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
