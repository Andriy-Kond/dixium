import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectGame,
  selectGamePlayers,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./Lobby.module.scss";
import { useState } from "react";
import { setFirstStoryteller } from "redux/game/gameSlice.js";
import socket from "servises/socket.js";
import Button from "common/components/ui/Button/index.js";

export default function Lobby() {
  const dispatch = useDispatch();
  const { currentGameId } = useParams();
  const currentGame = useSelector(selectGame(currentGameId));
  const storytellerId = useSelector(selectStorytellerId(currentGameId));

  const userCredentials = useSelector(selectUserCredentials);
  const gamePlayers = useSelector(selectGamePlayers(currentGameId));
  const currentPlayer = gamePlayers.find(p => p._id === userCredentials._id);

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
  );
}
