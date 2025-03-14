import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
// import { CgSpinnerTwoAlt } from "react-icons/cg";

import {
  selectGamePlayers,
  selectHostPlayerId,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./Players.module.scss";
import Button from "common/components/ui/Button/index.js";

export default function Players({ isActiveScreen, setMiddleButton }) {
  const { gameId } = useParams();
  const players = useSelector(selectGamePlayers(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const gamePlayers = useSelector(selectGamePlayers(gameId));

  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;

  useEffect(() => {
    // console.log("Players >> isActiveScreen:::", isActiveScreen );
    if (isActiveScreen) {
      // console.log("Players >> Clearing middle button");

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

      // setMiddleButton(null);
    }
  }, [
    gamePlayers,
    hostPlayerId,
    isActiveScreen,
    isCurrentPlayerStoryteller,
    setMiddleButton,
    userCredentials._id,
  ]);

  return (
    <>
      <p>Players</p>

      <ul className={css.playersList}>
        {players.map(player => (
          <li className={css.player} key={player._id}>
            <div>{player.name.toUpperCase()}</div>

            {/* стилі через css: */}
            {/* <span
              className={`${css.playerState} ${
                !isPlayerVoted
                  ? css.waiting
                  : isCurrentPlayerStoryteller
                  ? css.storyteller
                  : css.voted
              }`}></span> */}

            {/* стилі через компоненти: */}
            <span className={css.playerState}>
              {!player.isVoted ? (
                // <CgSpinnerTwoAlt className={css.spin} />
                <div className={css.waiting}></div>
              ) : player._id === storytellerId ? (
                <FaCircleCheck className={css.storyteller} />
              ) : (
                <FaCheck className={css.voted} />
              )}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
