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
  isActive,
  setMiddleButton,
  isCarouselMode,
  setIsCarouselMode,
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

  const [selectedCardId, setSelectedCardId] = useState(null);
  const onSelectCard = cardId =>
    setSelectedCardId(cardId === selectedCardId ? null : cardId);

  const [idx, setIdx] = useState(0);

  const [selectedCards, setSelectedCards] = useState([]);
  const [emblaRefCards, emblaApiCards] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: idx,
  });

  const toggleCardSelection = useCallback(
    starIndex => {
      const currentCardIndex = emblaApiCards?.selectedScrollSnap();
      const currentCard = playerHand[currentCardIndex];
      if (!currentCard) return;

      setSelectedCards(prev => {
        const isSelected = prev.some(card => card._id === currentCard._id);
        if (isSelected) {
          return prev.filter(card => card._id !== currentCard._id);
        } else if (prev.length < 2) {
          return gamePlayers.length > 3 && starIndex === 0 && prev.length === 1
            ? [currentCard, currentCard]
            : [...prev, currentCard];
        }
        return prev;
      });
    },
    [emblaApiCards, gamePlayers.length, playerHand],
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

  const vote = useCallback(() => {
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

  useEffect(() => {
    // if (isActive && isCurrentPlayerStoryteller) {
    //   setMiddleButton(null);
    // }
    if (isActive) {
      if (isCarouselMode) {
        const currentCardIndex = idx || emblaApiCards?.selectedScrollSnap();
        const currentCard = playerHand[currentCardIndex];
        const isFirstStarSelected = selectedCards[0]?._id === currentCard?._id;
        const isSecondStarSelected = selectedCards[1]?._id === currentCard?._id;

        setMiddleButton(
          <>
            <Button btnText="Back" onClick={exitCarouselMode} />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}>
              {!isCurrentPlayerStoryteller && (
                <>
                  <Button
                    name="firstBtn"
                    btnText="★"
                    onClick={() => toggleCardSelection(0)}
                    disabled={
                      selectedCards.length === 2 &&
                      (gamePlayers.length > 3
                        ? false
                        : !isFirstStarSelected &&
                          selectedCards[0]?._id !== currentCard?._id)
                    }
                  />
                  <Button
                    name="secondBtn"
                    btnText="★"
                    onClick={() => toggleCardSelection(1)}
                    disabled={
                      selectedCards.length === 2 &&
                      (gamePlayers.length > 3
                        ? false
                        : !isSecondStarSelected &&
                          selectedCards[1]?._id !== currentCard?._id)
                    }
                  />
                </>
              )}
            </div>
          </>,
        );
      } else if (isFirstTurn) {
        isCurrentPlayerStoryteller && returnToHand();

        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Close mask"}
            onClick={returnToHand}
          />,
        );
      } else {
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={!storytellerId ? "Tell your story" : "Vote"}
            onClick={vote}
            disabled={!selectedCardId}
          />,
        );
      }
    }
  }, [
    emblaApiCards,
    exitCarouselMode,
    gamePlayers.length,
    idx,
    isActive,
    isCarouselMode,
    isCurrentPlayerStoryteller,
    isFirstTurn,
    playerHand,
    returnToHand,
    selectedCardId,
    selectedCards,
    setMiddleButton,
    storytellerId,
    toggleCardSelection,
    vote,
  ]);

  const carouselModeOn = idx => {
    console.log(" idx:::", idx);
    setIdx(idx);
    setIsCarouselMode(true);
  };

  // KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApiCards) return;
      if (event.key === "ArrowLeft") {
        emblaApiCards.scrollPrev();
      } else if (event.key === "ArrowRight") {
        emblaApiCards.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApiCards]);
  console.log(" isFirstTurn:::", isFirstTurn);

  if (isFirstTurn && !isCurrentPlayerStoryteller) {
    return <Mask />;
  }

  return (
    <>
      <p>Hand</p>
      <p>{paragraphText}</p>

      {isCarouselMode ? (
        <div className={css.carouselWrapper} ref={emblaRefCards}>
          <div className={css.carouselContainer}>
            {playerHand.map(card => (
              <div className={css.carouselSlide} key={card._id}>
                <img src={card.url} alt="card" className={css.carouselImage} />
                {selectedCards.some(sc => sc._id === card._id) && (
                  <span className={css.checkbox}>★</span>
                )}
              </div>
            ))}
          </div>
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
                {selectedCards.some(sc => sc._id === card._id) && (
                  <span className={css.checkbox}>★</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
