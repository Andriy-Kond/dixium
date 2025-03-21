import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
// import { CgSpinnerTwoAlt } from "react-icons/cg";
import { FaCircle } from "react-icons/fa6";

import {
  selectGamePlayers,
  selectGameStatus,
  selectHostPlayerId,
  selectIsSingleCardMode,
  selectScores,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./Players.module.scss";
import Button from "common/components/ui/Button/index.js";
import { ROUND_RESULTS, GUESSING, VOTING } from "utils/generals/constants.js";
import { useVote } from "hooks/useVote.js";

export default function Players({
  isActiveScreen,
  setMiddleButton,
  startVoting,
  finishRound,
}) {
  const { gameId } = useParams();
  const players = useSelector(selectGamePlayers(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const scores = useSelector(selectScores(gameId));
  const gameStatus = useSelector(selectGameStatus(gameId));

  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;
  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);

  const isCurrentPlayerVoted = gamePlayers.some(
    player => player._id === userCredentials._id && player.isVoted,
  );

  const playersMoreThanThree = gamePlayers.length > 3;
  const isCanVote = playersMoreThanThree && isSingleCardMode;
  const isStartVotingDisabled = gamePlayers.some(player => !player.isGuessed);

  useEffect(() => {
    if (!isActiveScreen) return;
    // console.log("Players >> isActiveScreen:::", isActiveScreen );
    // console.log("Players >> Clearing middle button");

    // if (
    //   hostPlayerId === userCredentials._id &&
    //   isReadyToCalculatePoints &&
    //   gameStatus === GUESSING
    // ) {
    //   setMiddleButton(
    //     <Button
    //       btnStyle={["btnFlexGrow"]}
    //       btnText={"Finish round"}
    //       onClick={finishRound}
    //     />,
    //   );
    // } else setMiddleButton(null);

    if (gameStatus === GUESSING) {
      if (hostPlayerId === userCredentials._id && isReadyToVote) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Start voting"}
            onClick={startVoting}
            disabled={isStartVotingDisabled}
          />,
        );
      } else setMiddleButton(null);
    } else if (gameStatus === VOTING) {
      if (hostPlayerId === userCredentials._id && isReadyToCalculatePoints) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Finish round"}
            onClick={finishRound}
          />,
        );
      } else setMiddleButton(null);
    } else setMiddleButton(null);
  }, [
    finishRound,
    gameStatus,
    hostPlayerId,
    isActiveScreen,
    isReadyToCalculatePoints,
    isReadyToVote,
    isStartVotingDisabled,
    setMiddleButton,
    startVoting,
    userCredentials._id,
  ]);

  return (
    <>
      <p>Players</p>

      <ul className={css.playersList}>
        {players.map(player => {
          const maxScore = Math.max(...Object.values(scores)); // Максимальний бал для цього раунду
          const playerScore = scores[player._id] || 0; // Бал поточного гравця
          const fillPercentage =
            maxScore > 0 ? (playerScore / maxScore) * 100 : 0; // Відсоток замальовки для поточного гравця

          return (
            <li
              className={css.player}
              key={player._id}
              style={{
                "--fill-percentage": `${fillPercentage}%`,
              }}>
              <div>{player.name.toUpperCase()}</div>

              <div className={css.playerState}>
                {gameStatus === ROUND_RESULTS ? (
                  player._id === storytellerId ? (
                    <>
                      <FaCircle className={css.storyteller} />
                      <span
                        className={css.storytellerWrapper}
                        style={{ "--color": "#fff" }}>
                        {playerScore}
                      </span>
                    </>
                  ) : (
                    <span
                      className={css.storytellerWrapper}
                      style={{ "--color": "#5D7E9E" }}>
                      {playerScore}
                    </span>
                  )
                ) : !player.isGuessed ? (
                  // <CgSpinnerTwoAlt className={css.spin} />
                  <div className={css.waiting}></div>
                ) : player._id === storytellerId ? (
                  <FaCircleCheck className={css.storyteller} />
                ) : (
                  <FaCheck className={css.guessed} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
