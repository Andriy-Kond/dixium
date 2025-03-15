import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectCardsOnTable,
  selectGamePlayers,
  selectHostPlayerId,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import Mask from "common/components/game/Mask";
import css from "./Table.module.scss";
import Button from "common/components/ui/Button/index.js";

export default function Table({ isActiveScreen, setMiddleButton }) {
  const { gameId } = useParams();
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const gamePlayers = useSelector(selectGamePlayers(gameId));

  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;

  useEffect(() => {
    if (!isActiveScreen) return;
    // console.log("Table >> isActiveScreen:::",isActiveScreen, );
    // console.log("Table >> Setting middle button");

    if (isCurrentPlayerStoryteller) {
      const roundReady = !gamePlayers.some(player => !player.isVoted);
      if (hostPlayerId === userCredentials._id && roundReady) {
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Finish round"}
            // onClick={calculatePoints}
          />,
        );
      } else {
        setMiddleButton(null); // Очищаємо кнопку для сторітеллера
      }
    }
  }, [
    gamePlayers,
    hostPlayerId,
    isActiveScreen,
    isCurrentPlayerStoryteller,
    setMiddleButton,
    userCredentials._id,
  ]);

  // Math.floor(Math.random() * (max - min + 1)) + min - формула діапазону
  return (
    <>
      <p>Table</p>

      <ul className={css.table}>
        {cardsOnTable.map((card, idx) => (
          <li key={card._id}>
            <Mask
              rotation={30 + idx * 30}
              top={Math.round(Math.random() * (40 - 20 + 1)) + 20}
              left={Math.round(Math.random() * (40 - 20 + 1)) + 20}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
