import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import socket from "servises/socket.js";

import useEmblaCarousel from "embla-carousel-react";
import {
  selectCardsOnTable,
  selectGame,
  selectGameDeck,
  selectGameDiscardPile,
  selectGamePlayers,
  selectGameStatus,
  selectPlayerHand,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./Lobby.module.scss";

import Button from "common/components/ui/Button/index.js";
import { MAKING_TURN } from "utils/generals/constants.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";

import Hand from "common/components/game/Hand";
import Players from "common/components/game/Players";
import Table from "common/components/game/Table";

function Lobby() {
  const { currentGameId } = useParams();
  const [activeScreen, setActiveScreen] = useState(0);

  const currentGame = useSelector(selectGame(currentGameId));
  const storytellerId = useSelector(selectStorytellerId(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);
  const gameStatus = useSelector(selectGameStatus(currentGameId));
  const gamePlayers = useSelector(selectGamePlayers(currentGameId));
  const cardsOnTable = useSelector(selectCardsOnTable(currentGameId));
  const gameDeck = useSelector(selectGameDeck(currentGameId));
  const gameDiscardPile = useSelector(selectGameDiscardPile(currentGameId));
  const playerHand = useSelector(
    selectPlayerHand(currentGameId, userCredentials._id),
  );

  const screens = [<Hand />, <Players />, <Table />];

  const storyteller = gamePlayers.find(p => p._id === storytellerId);
  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);
  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;

  const [selectedCardId, setSelectedCardId] = useState(null);

  const [emblaRef, emblaApi] = useEmblaCarousel();
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(activeScreen);
    }
  }, [activeScreen, emblaApi]);

  // Memoized fn for useEffect:
  const nextScreen = useCallback(() => {
    // Перейти до наступного екрану, якщо не останній
    setActiveScreen(prev => (prev < screens.length - 1 ? prev + 1 : prev));
  }, [screens.length]);

  const prevScreen = useCallback(() => {
    // Перейти до попереднього екрану, якщо не перший
    setActiveScreen(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  // KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (event.key === "ArrowLeft") {
        prevScreen();
      } else if (event.key === "ArrowRight") {
        nextScreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nextScreen, prevScreen]);

  const onSelectCard = cardId => {
    if (cardId === selectedCardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  const vote = () => {
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
        gameStatus: MAKING_TURN,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        deck: updatedDeck,
        discardPile: updatedDiscardPile,
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
  };

  const btnText = !storytellerId ? "Tell your story" : "Choose association";

  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  return (
    <>
      <p>Lobby</p>
      <p>{paragraphText}</p>
      <ul className={`${css.currentDeck}`}>
        {currentPlayer.hand.map(card => (
          <li
            className={css.card}
            key={card._id}
            onClick={() => onSelectCard(card._id)}>
            <img
              className={`${css.img} ${
                selectedCardId && selectedCardId !== card._id && css.imgInactive
              }`}
              src={card.url}
              alt="card"
            />
          </li>
        ))}
      </ul>

      <div ref={emblaRef} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          {screens.map((screen, index) => (
            <div key={index} style={{ flex: "0 0 100%" }}>
              {screen}
            </div>
          ))}
        </div>
      </div>

      <Button
        btnText={"<"}
        onClick={prevScreen}
        disabled={activeScreen === 0}
      />

      <span>
        {activeScreen + 1} / {screens.length}
      </span>
      <Button
        btnText={">"}
        onClick={nextScreen}
        disabled={activeScreen === screens.length - 1}
      />

      <div className={css.bottomBar}>
        {!isCurrentPlayerStoryteller && (
          <Button btnText={btnText} onClick={vote} disabled={!selectedCardId} />
        )}
      </div>
    </>
  );
}
