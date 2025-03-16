import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
// import { CgSpinnerTwoAlt } from "react-icons/cg";

import {
  selectGamePlayers,
  selectHostPlayerId,
  selectIsSingleCardMode,
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
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;
  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);

  const isCurrentPlayerVoted = gamePlayers.some(
    player => player._id === userCredentials._id && player.isVoted,
  );

  const playersMoreThanThree = gamePlayers.length > 3;
  const isCanVote = playersMoreThanThree && isSingleCardMode;

  useEffect(() => {
    if (!isActiveScreen) return;
    // console.log("Players >> isActiveScreen:::", isActiveScreen );
    // console.log("Players >> Clearing middle button");

    if (hostPlayerId === userCredentials._id && isReadyToCalculatePoints) {
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText={"Finish round"}
          // onClick={calculatePoints}
        />,
      );
    } else if (
      !storytellerId ||
      isCurrentPlayerStoryteller ||
      isCurrentPlayerVoted ||
      !isCanVote
    )
      setMiddleButton(null);
  }, [
    gamePlayers,
    hostPlayerId,
    isActiveScreen,
    isCanVote,
    isCurrentPlayerStoryteller,
    isCurrentPlayerVoted,
    isReadyToCalculatePoints,
    isSingleCardMode,
    playersMoreThanThree,
    setMiddleButton,
    storytellerId,
    userCredentials._id,
  ]);

  return (
    <>
      <p>Players</p>

      <ul className={css.playersList}>
        {players.map(player => (
          <li className={css.player} key={player._id}>
            <div>{player.name.toUpperCase()}</div>

            {/* стилі через компоненти: */}
            <span className={css.playerState}>
              {!player.isGuessed ? (
                // <CgSpinnerTwoAlt className={css.spin} />
                <div className={css.waiting}></div>
              ) : player._id === storytellerId ? (
                <FaCircleCheck className={css.storyteller} />
              ) : (
                <FaCheck className={css.guessed} />
              )}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
