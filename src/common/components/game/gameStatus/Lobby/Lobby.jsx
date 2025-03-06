import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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
import { useState } from "react";

import socket from "servises/socket.js";
import Button from "common/components/ui/Button/index.js";
import { LOBBY, MAKING_TURN } from "utils/generals/constants.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";

export default function Lobby() {
  const { currentGameId } = useParams();
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

  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);

  const [selectedCardId, setSelectedCardId] = useState(null);

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

    // Якщо оповідач ще не визначений, гравець стає першим оповідачем
    if (!storytellerId) {
      // Оновлюємо руку гравця (видаляємо вибрану карту)
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

      // const newCard = updatedDeck[0]; // Беремо нову карту з колоди
      // updatedDeck.splice(0, 1); // Оновлюємо колоду (видаляємо використану карту)
      const newCard = updatedDeck.shift(); // shift повертає перший елемент і видаляє його
      updatedPlayerHand.push(newCard);

      // Додаємо карту на стіл
      const updatedCardsOnTable = [...cardsOnTable, movedCard];

      // Оновлюємо гравців
      const updatedPlayers = gamePlayers.map(player =>
        player._id === userCredentials._id
          ? { ...player, hand: updatedPlayerHand }
          : player,
      );

      // Оновлюємо гру з новими масивами
      const updatedGame = {
        ...currentGame,
        storytellerId: userCredentials._id,
        gameStatus: MAKING_TURN,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        deck: updatedDeck,
        discardPile: updatedDiscardPile,
      };

      // Відправляємо оновлену гру через сокет
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

  return (
    <>
      <p>Lobby</p>

      <p>
        Be the first to think of an association for one of your cards. Choose it
        and make a move. Tell us about your association.
      </p>

      <ul className={`${css.currentDeck}`}>
        {currentPlayer.hand.map(card => (
          <li
            className={css.card}
            key={card._id}
            onClick={!storytellerId ? () => onSelectCard(card._id) : undefined}>
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

      <div className={css.bottomBar}>
        <Button
          btnText={"Vote"}
          onClick={vote}
          disabled={!selectedCardId || gameStatus !== LOBBY}
        />
      </div>
    </>
  );
}
