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
import { MAKING_TURN } from "utils/generals/constants.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";
import Mask from "../Mask/Mask.jsx";

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

  const [selectedCardId, setSelectedCardId] = useState(null);

  const onSelectCard = cardId =>
    setSelectedCardId(cardId === selectedCardId ? null : cardId);

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
        gameStatus: MAKING_TURN,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        deck: updatedDeck,
        discardPile: updatedDiscardPile,
        isFirstTurn: true,
      };

      socket.emit("setFirstStoryteller", { updatedGame }, response => {
        if (response?.error) {
          console.error("Failed to update game:", response.error);
        }
      });

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

  const btnText = !storytellerId ? "Tell your story" : "Choose association";

  const paragraphText = !storytellerId
    ? "Be the first to think of an association for one of your cards. Choose it and make a move. Tell us about your association."
    : isCurrentPlayerStoryteller
    ? "You have told your story. Waiting for other players to choose their associations"
    : `Player ${storyteller.name.toUpperCase()} has told his history. Choose a card to associate with it.`;

  const returnToHand = useCallback(() => {
    const updatedGame = {
      ...currentGame,
      isFirstTurn: false,
    };

    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });
  }, [currentGame]);

  useEffect(() => {
    if (isActive && isCurrentPlayerStoryteller) {
      setMiddleButton(null);
    } else {
      isFirstTurn
        ? setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={"Close mask"}
              onClick={returnToHand}
            />,
          )
        : setMiddleButton(
            <Button
              btnStyle={["btnFlexGrow"]}
              btnText={btnText}
              onClick={vote}
              disabled={!selectedCardId}
            />,
          );
    }
  }, [
    btnText,
    isActive,
    isCurrentPlayerStoryteller,
    isFirstTurn,
    returnToHand,
    selectedCardId,
    setMiddleButton,
    vote,
  ]);

  return (
    <>
      {isFirstTurn && !isCurrentPlayerStoryteller ? (
        <Mask />
      ) : (
        <div>
          <p>Hand</p>
          <p>{paragraphText}</p>
          <ul className={`${css.currentDeck}`}>
            {currentPlayer.hand.map(card => (
              <li
                className={css.card}
                key={card._id}
                onClick={() => onSelectCard(card._id)}>
                <img
                  className={`${css.img} ${
                    selectedCardId &&
                    selectedCardId !== card._id &&
                    css.imgInactive
                  }`}
                  src={card.url}
                  alt="card"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
