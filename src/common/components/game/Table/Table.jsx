import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { selectCardsOnTable } from "redux/selectors.js";
import Mask from "common/components/game/Mask";
import css from "./Table.module.scss";

export default function Table({ isActiveScreen, setMiddleButton }) {
  const { gameId } = useParams();
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));

  useEffect(() => {
    // console.log("Table >> isActiveScreen:::",isActiveScreen, );
    if (isActiveScreen) {
      // console.log("Table >> Setting middle button");
      setMiddleButton(null);
    }
  }, [isActiveScreen, setMiddleButton]);

  // Math.floor(Math.random() * (max - min + 1)) + min - формула діапазону
  return (
    <>
      <p>Table</p>

      <ul className={css.table}>
        {cardsOnTable.map((card, idx) => (
          <li>
            <Mask
              key={card._id}
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
