import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectCurrentStorytellerId,
  selectGame,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./Game.module.scss";
import { useState } from "react";
import Button from "common/components/Button/index.js";
import { setFirstStoryteller } from "features/game/gameSlice.js";
import socket from "servises/socket.js";

export default function Game() {
  const dispatch = useDispatch();
  const { currentGameId } = useParams();
  const currentStorytellerId = useSelector(selectCurrentStorytellerId);
  const currentGame = useSelector(selectGame(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);
  const currentPlayer = currentGame.players.find(
    p => p._id === userCredentials._id,
  );

  const [selectedCard, setSelectedCard] = useState(null);

  const onSelectCard = cardId => {
    if (cardId === selectedCard) {
      setSelectedCard(null);
    } else {
      setSelectedCard(cardId);
    }
  };

  const vote = () => {
    if (!currentStorytellerId) {
      // optimistic update
      dispatch(
        setFirstStoryteller({
          gameId: currentGameId,
          playerId: userCredentials._id,
        }),
      );

      socket.emit("setFirstStoryteller", {
        currentGame,
        player: userCredentials,
      });
    }
  };

  return (
    <>
      <p>Game</p>
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
              !currentStorytellerId
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
