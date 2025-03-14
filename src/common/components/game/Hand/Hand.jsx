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

import { VOTING } from "utils/generals/constants.js";
import Button from "common/components/ui/Button";
import Mask from "../Mask/Mask.jsx";

import css from "./Hand.module.scss";
import { useTellStory } from "hooks/useTellStory.js";
import { useVote } from "hooks/useVote.js";

export default function Hand({
  isActiveScreen,
  setMiddleButton,
  isCarouselMode,
  setIsCarouselMode,
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

  const onSelectCard = cardId =>
    setSelectedCardId(cardId === selectedCardId ? null : cardId);

  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

  const [cardsSet, setCardsSet] = useState({
    firstCard: null,
    secondCard: null,
  });

  const { firstCard, secondCard } = cardsSet;

  const tellStory = useTellStory(gameId, selectedCardId, setSelectedCardId);

  const vote = useVote(cardsSet, gameId);

  const [emblaRefCardsVote, emblaApiCards] = useEmblaCarousel({
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

      const currentCardIndex = emblaApiCards?.selectedScrollSnap() || 0;
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
    [emblaApiCards, isSingleCardMode, playerHand, playersMoreThanThree],
  );

  const exitCarouselMode = useCallback(() => {
    setIsCarouselMode(false);
    setMiddleButton(null);
  }, [setIsCarouselMode, setMiddleButton]);

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

  const calculatePoints = () => {};

  const handleVoting = useCallback(() => {
    gameStatus === VOTING ? vote() : tellStory();
    setCardsSet({ firstCard: null, secondCard: null });
  }, [gameStatus, tellStory, vote]);

  // Отримання індексу активної карти
  useEffect(() => {
    if (!emblaApiCards) return; // Перевірка на наявність API
    const onSelect = () => setActiveCardIdx(emblaApiCards.selectedScrollSnap());
    emblaApiCards.on("select", onSelect); // Підписка на подію зміни слайда
    return () => emblaApiCards.off("select", onSelect);
  }, [emblaApiCards]);

  // KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApiCards) return;
      if (event.key === "ArrowLeft") emblaApiCards.scrollPrev();
      else if (event.key === "ArrowRight") emblaApiCards.scrollNext();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApiCards]);

  const isCanVote =
    playersMoreThanThree && isSingleCardMode
      ? !!firstCard?._id
      : !!firstCard?._id && !!secondCard?._id;

  const isCurrentPlayerVoted = gamePlayers.some(
    player => player._id === userCredentials._id && player.isVoted,
  );

  useEffect(() => {
    if (!isActiveScreen) return;

    if (isCarouselMode) {
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
                  disabled={isDisabledFirstBtn || isCurrentPlayerVoted}
                  localClassName={cardsSet.firstCard && css.btnActive}
                />
                {!isSingleCardMode && (
                  <Button
                    btnText="★2"
                    onClick={() => toggleCardSelection("secondCard")}
                    disabled={isDisabledSecondBtn || isCurrentPlayerVoted}
                    localClassName={cardsSet.secondCard && css.btnActive}
                  />
                )}
              </>
            )}
          </div>
        </>,
      );
    } else if (isFirstTurn) {
      // Якщо це не карусель-режим і одразу після першого ходу
      isCurrentPlayerStoryteller
        ? returnToHand() // для сторітеллера автоматично закривається екран-маска
        : // Для інших гравців показується екран-маска, та кнопка закриття маски:
          setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={"Close mask"}
              onClick={returnToHand}
            />,
          );
    } else {
      // Якщо це не карусель-режим і закритий екран-маска (вже не isFirstTurn) - до голосування за карти

      if (isCurrentPlayerStoryteller) {
        setMiddleButton(null); // Очищаємо кнопку для сторітеллера
      } else {
        // ЯКщо це не сторітеллер:
        // Перевірка чи це ведучий:
        // const roundReady = !gamePlayers.some(player => !player.isVoted);
        const roundReady = gamePlayers.every(player => player.isVoted);
        if (hostPlayerId === userCredentials._id && roundReady) {
          setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={"Finish round"}
              onClick={calculatePoints}
            />,
          );
        } else {
          setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={!storytellerId ? "Tell your story" : "Vote"}
              onClick={handleVoting}
              disabled={
                gameStatus === VOTING
                  ? !isCanVote && isCurrentPlayerVoted
                  : !selectedCardId
              }
            />,
          );
        }
      }
    }
  }, [
    activeCardIdx,
    cardsSet.firstCard,
    cardsSet.secondCard,
    exitCarouselMode,
    firstCard,
    gamePlayers,
    gameStatus,
    handleVoting,
    hostPlayerId,
    isActiveScreen,
    isCanVote,
    isCarouselMode,
    isCurrentPlayerStoryteller,
    isCurrentPlayerVoted,
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
  ]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);
    setIsCarouselMode(true);
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

      {isCarouselMode ? (
        <div className={css.carouselWrapper} ref={emblaRefCardsVote}>
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
            {currentPlayer.hand.map((card, selectedCardIdx) => (
              <li
                className={css.card}
                key={card._id}
                onClick={
                  gameStatus === VOTING
                    ? () => carouselModeOn(selectedCardIdx)
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
