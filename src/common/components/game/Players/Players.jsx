import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { selectGamePlayers } from "redux/selectors.js";
import css from "./Players.module.scss";

export default function Players({ isActiveScreen, setMiddleButton }) {
  const { gameId } = useParams();
  const players = useSelector(selectGamePlayers(gameId));
  useEffect(() => {
    // console.log("Players >> isActiveScreen:::", isActiveScreen );
    if (isActiveScreen) {
      // console.log("Players >> Clearing middle button");
      setMiddleButton(null);
    }
  }, [isActiveScreen, setMiddleButton]);

  return (
    <>
      <p>Players</p>

      <ul className={css.playersList}>
        {players.map(player => (
          <li className={css.player}> {player.name.toUpperCase()}</li>
        ))}
      </ul>
    </>
  );
}
