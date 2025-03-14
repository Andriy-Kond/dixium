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
  selectIsFirstTurn,
  selectPlayerHand,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";

import Button from "common/components/ui/Button";
import css from "./Hand.module.scss";
import Mask from "../Mask/Mask.jsx";
import useEmblaCarousel from "embla-carousel-react";

export default function Hand({ isActive, setMiddleButton }) {
  const { gameId } = useParams();
  const isFirstTurn = useSelector(selectIsFirstTurn(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const currentGame = useSelector(selectGame(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const gameDeck = useSelector(selectGameDeck(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const gameDiscardPile = useSelector(selectGameDiscardPile(gameId));

  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);
  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;

  // Переривання подій
  const stopPropagation = e => {
    e.stopPropagation();
  };

  const [isCarouselMode, setIsCarouselMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [emblaRefCards, emblaApiCards] = useEmblaCarousel({
    loop: true,
    align: "center",
    // nested: true,
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
  }, [setMiddleButton]);

  const vote = useCallback(() => {
    if (selectedCards.length === 0) {
      console.warn("No cards selected!");
      return;
    }

    const updatedPlayerHand = playerHand.filter(
      card => !selectedCards.some(sc => sc._id === card._id),
    );
    const updatedCardsOnTable = [...cardsOnTable, ...selectedCards];
    const updatedDeck = [...gameDeck];
    const updatedDiscardPile = [...gameDiscardPile];

    while (
      updatedPlayerHand.length < playerHand.length &&
      updatedDeck.length > 0
    ) {
      updatedPlayerHand.push(updatedDeck.shift());
    }

    const updatedPlayers = gamePlayers.map(player =>
      player._id === userCredentials._id
        ? { ...player, hand: updatedPlayerHand }
        : player,
    );

    const updatedGame = {
      ...currentGame,
      cardsOnTable: updatedCardsOnTable,
      players: updatedPlayers,
      deck: updatedDeck,
      discardPile: updatedDiscardPile,
    };

    socket.emit("updateGame", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    setSelectedCards([]);
    exitCarouselMode();
  }, [
    cardsOnTable,
    currentGame,
    exitCarouselMode,
    gameDeck,
    gameDiscardPile,
    gamePlayers,
    playerHand,
    selectedCards,
    userCredentials._id,
  ]);

  const returnToHand = useCallback(() => {
    const updatedGame = { ...currentGame, isFirstTurn: false };

    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });
  }, [currentGame]);

  useEffect(() => {
    if (!isActive || isCurrentPlayerStoryteller) {
      setMiddleButton(null);
      return;
    }

    if (isCarouselMode) {
      const currentCardIndex = emblaApiCards?.selectedScrollSnap() || 0;
      const currentCard = playerHand[currentCardIndex];
      const isFirstStarSelected = selectedCards[0]?._id === currentCard?._id;
      const isSecondStarSelected = selectedCards[1]?._id === currentCard?._id;

      setMiddleButton(
        <div className={css.carouselButtons}>
          <Button
            btnStyle={["btnFlexGrow"]}
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
            btnStyle={["btnFlexGrow"]}
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
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText="Back"
            onClick={exitCarouselMode}
          />
          {selectedCards.length === 2 && (
            <Button btnStyle={["btnFlexGrow"]} btnText="Vote" onClick={vote} />
          )}
        </div>,
      );
    } else if (isFirstTurn) {
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText="Close mask"
          onClick={returnToHand}
        />,
      );
    } else {
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText={!storytellerId ? "Tell your story" : "Choose association"}
          onClick={() => setIsCarouselMode(true)}
        />,
      );
    }
  }, [
    isActive,
    isCarouselMode,
    isCurrentPlayerStoryteller,
    isFirstTurn,
    selectedCards,
    gamePlayers.length,
    emblaApiCards,
    vote,
    returnToHand,
    setMiddleButton,
    playerHand,
    exitCarouselMode,
    toggleCardSelection,
    storytellerId,
  ]);

  if (isFirstTurn && !isCurrentPlayerStoryteller) {
    return <Mask />;
  }

  return (
    <div>
      <p>Hand</p>
      <p>
        {!storytellerId
          ? "Be the first to think of an association for one of your cards."
          : isCurrentPlayerStoryteller
          ? "You have told your story. Waiting for other players."
          : `Player ${storyteller.name.toUpperCase()} has told his story. Choose a card.`}
      </p>
      {isCarouselMode ? (
        <div
          className={css.carouselWrapper}
          ref={emblaRefCards}
          onTouchStart={stopPropagation}
          onTouchMove={stopPropagation}
          onTouchEnd={stopPropagation}
          onMouseDown={stopPropagation}
          onMouseMove={stopPropagation}
          onMouseUp={stopPropagation}>
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
        <ul className={css.currentDeck}>
          {currentPlayer.hand.map(card => (
            <li
              className={css.card}
              key={card._id}
              onClick={() => setIsCarouselMode(true)}>
              <img src={card.url} alt="card" className={css.img} />
              {selectedCards.some(sc => sc._id === card._id) && (
                <span className={css.checkbox}>★</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
