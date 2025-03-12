import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import socket from "services/socket.js";

import {
  selectCardsOnTable,
  selectGame,
  selectGameDeck,
  selectGameDiscardPile,
  selectGamePlayers,
  selectGameStatus,
  selectIsFirstTurn,
  selectPlayerHand,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";

import Button from "common/components/ui/Button";
import css from "./Hand.module.scss";
import { VOTING } from "utils/generals/constants.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";
import Mask from "../Mask/Mask.jsx";
import useEmblaCarousel from "embla-carousel-react";

export default function Hand({
  isActiveScreen,
  setMiddleButton,
  isCarouselMode,
  setIsCarouselMode,
  isSingleCardMode,
}) {
  const { currentGameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(currentGameId));
  const isFirstTurn = useSelector(selectIsFirstTurn(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);
  const storytellerId = useSelector(selectStorytellerId(currentGameId));
  const playerHand = useSelector(
    selectPlayerHand(currentGameId, userCredentials._id),
  );
  const currentGame = useSelector(selectGame(currentGameId));
  const cardsOnTable = useSelector(selectCardsOnTable(currentGameId));
  const gameDeck = useSelector(selectGameDeck(currentGameId));
  const gamePlayers = useSelector(selectGamePlayers(currentGameId));
  const gameDiscardPile = useSelector(selectGameDiscardPile(currentGameId));

  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);
  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;

  const playersMoreThanThree = gamePlayers.length > 3;

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

  const [emblaRefCards, emblaApiCards] = useEmblaCarousel({
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

        // Якщо поточна картка є в об'єкті:
        if (isSelected && prev[btnKey]?._id === currentCard._id) {
          // Якщо карта вже обрана цією кнопкою, знімаємо вибір
          return { ...prev, [btnKey]: null };
        } else if (
          // Якщо поточної картки немає в об'єкті:
          // Якщо одна з комірок вільна, або якщо обрана картка у поточній комірці
          !prev.firstCard ||
          !prev.secondCard ||
          prev[btnKey]?._id === currentCard._id
        ) {
          // Якщо є вільне місце або це скасування
          const otherCard =
            btnKey === "firstCard" ? prev.secondCard : prev.firstCard; // визначення яка комірка об'єкту "інша"
          // Якщо гравців троє, і якщо "інша" комірка вже має в собі поточну картку
          if (!playersMoreThanThree && otherCard?._id === currentCard._id) {
            console.log("error: cards must be different");
            return prev;
          }
          // Якщо поточної картки немає у натиснутій кнопці-комірки, то вставляємо її туди:
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

  const firstStory = useCallback(() => {
    if (!selectedCardId) {
      console.warn("No card selected!");
      return;
    }

    const movedCard = playerHand.find(c => c._id === selectedCardId);
    if (!movedCard) {
      console.warn("Selected card not found in hand!");
      return;
    }

    // If storyteller not defined, the player becomes the first storyteller
    if (!storytellerId) {
      const updatedPlayerHand = playerHand.filter(
        card => card._id !== selectedCardId,
      );
      const updatedDeck = [...gameDeck];
      const updatedDiscardPile = [...gameDiscardPile];

      if (updatedDeck.length === 0) {
        if (updatedDiscardPile.length === 0) {
          console.warn("No cards left in deck or discard pile!");
          return;
        }
        updatedDeck.push(...shuffleDeck([...updatedDiscardPile]));
        updatedDiscardPile.length = 0;
      }

      const newCard = updatedDeck.shift(); // shift returns first element and remove it from array
      updatedPlayerHand.push(newCard);

      // Add card to table
      const updatedCardsOnTable = [...cardsOnTable, movedCard];

      // update players
      const updatedPlayers = gamePlayers.map(player =>
        player._id === userCredentials._id
          ? { ...player, hand: updatedPlayerHand }
          : player,
      );

      const updatedGame = {
        ...currentGame,
        storytellerId: userCredentials._id,
        gameStatus: VOTING,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        deck: updatedDeck,
        discardPile: updatedDiscardPile,
        isFirstTurn: true,
      };

      socket.emit(
        "setFirstStoryteller",
        { currentGame: updatedGame },
        response => {
          if (response?.error) {
            console.error("Failed to update game:", response.error);
          }
        },
      );

      // Очищаємо вибір
      setSelectedCardId(null);
    }
  }, [
    cardsOnTable,
    currentGame,
    gameDeck,
    gameDiscardPile,
    gamePlayers,
    playerHand,
    selectedCardId,
    storytellerId,
    userCredentials._id,
  ]);

  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  // Отримання індексу активної карти
  useEffect(() => {
    if (!emblaApiCards) return; // Перевірка на наявність API
    const onSelect = () => setActiveCardIdx(emblaApiCards.selectedScrollSnap());
    emblaApiCards.on("select", onSelect); // Підписка на подію зміни слайда
    return () => emblaApiCards.off("select", onSelect);
  }, [emblaApiCards]);

  const isCanVote =
    playersMoreThanThree && isSingleCardMode
      ? !!firstCard?._id
      : !!firstCard?._id && !!secondCard?._id;

  useEffect(() => {
    if (isActiveScreen) {
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
                    disabled={isDisabledFirstBtn}
                    localClassName={cardsSet.firstCard && css.btnActive}
                  />
                  {!isSingleCardMode && (
                    <Button
                      btnText="★2"
                      onClick={() => toggleCardSelection("secondCard")}
                      disabled={isDisabledSecondBtn}
                      localClassName={cardsSet.secondCard && css.btnActive}
                    />
                  )}
                </>
              )}
            </div>
          </>,
        );
      } else if (isFirstTurn) {
        // Якщо це не карусуль-режим і одразу після першого ходу
        isCurrentPlayerStoryteller
          ? returnToHand() // для сторітеллера автоматично
          : // Для інших гравців - екран-маска:
            setMiddleButton(
              <Button
                btnStyle={["btnFlexGrow"]}
                btnText={"Close mask"}
                onClick={returnToHand}
              />,
            );
      } else {
        // Якщо це не карусель-режим і закритий екран-маска - до голосування за карти
        // !isCurrentPlayerStoryteller &&

        if (isCurrentPlayerStoryteller) {
          setMiddleButton(null); // Очищаємо кнопку для сторітеллера
        } else {
          setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={!storytellerId ? "Tell your story" : "Vote"}
              onClick={gameStatus === VOTING ? voting : firstStory}
              disabled={gameStatus === VOTING ? !isCanVote : !selectedCardId}
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
    firstStory,
    gameStatus,
    isActiveScreen,
    isCanVote,
    isCarouselMode,
    isCurrentPlayerStoryteller,
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
  ]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);
    setIsCarouselMode(true);
    setActiveCardIdx(idx);
  };

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

  // Set star(s) to card(s):
  const getStarMarks = cardId => {
    const marks = [];
    if (firstCard?._id === cardId) marks.push("★1");
    if (secondCard?._id === cardId) marks.push("★2");
    return marks;
  };

  const voting = () => {}; // todo

  if (isFirstTurn && !isCurrentPlayerStoryteller) {
    return <Mask />;
  }

  return (
    <>
      <p>Hand</p>
      <p>{paragraphText}</p>

      {isCarouselMode ? (
        <div className={css.carouselWrapper} ref={emblaRefCards}>
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
