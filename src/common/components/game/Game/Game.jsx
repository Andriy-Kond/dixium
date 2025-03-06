import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectStorytellerId,
  selectGame,
  selectUserCredentials,
  selectGameStatus,
} from "redux/selectors.js";
import css from "./Game.module.scss";
import { useState } from "react";
import Button from "common/components/ui/Button/index.js";
import { setFirstStoryteller } from "redux/game/gameSlice.js";
import socket from "servises/socket.js";

export default function Game() {
  const dispatch = useDispatch();
  const { currentGameId } = useParams();
  const storytellerId = useSelector(selectStorytellerId);
  const currentGame = useSelector(selectGame(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);
  const currentPlayer = currentGame.players.find(
    p => p._id === userCredentials._id,
  );

  const gameStatus = useSelector(selectGameStatus);

  const [selectedCard, setSelectedCard] = useState(null);

  const onSelectCard = cardId => {
    if (cardId === selectedCard) {
      setSelectedCard(null);
    } else {
      setSelectedCard(cardId);
    }
  };

  const vote = () => {
    if (!storytellerId) {
      dispatch(
        setFirstStoryteller({
          gameId: currentGameId,
          playerId: userCredentials._id,
        }),
      );

      const updatedGame = {
        ...currentGame,
        storytellerId: userCredentials._id,
        gameStatus: "makingTurn",
      };

      socket.emit("setFirstStoryteller", {
        currentGame: updatedGame,
        playerId: userCredentials._id,
      });
    }
  };

  return (
    <>
      {gameStatus === "lobby" && (
        <>
          <p>Game</p>
          <p>
            Be the first to think of an association for one of your cards.
            Choose it and make a move. Tell us about your association.
          </p>

          <ul className={`${css.currentDeck}`}>
            {currentPlayer.hand.map(card => (
              <li
                className={css.card}
                key={card._id}
                onClick={
                  !storytellerId
                    ? () => {
                        onSelectCard(card._id);
                      }
                    : undefined
                }>
                <img
                  className={`${css.img} ${
                    selectedCard && selectedCard !== card._id && css.imgInactive
                  }`}
                  src={card.url}
                  alt="card"
                />
              </li>
            ))}
          </ul>

          <div className={css.bottomBar}>
            <Button btnText={"Vote"} onClick={vote} disabled={!selectedCard} />
          </div>
        </>
      )}
    </>
  );
}
