// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
// import { CgSpinnerTwoAlt } from "react-icons/cg";
import { FaCircle } from "react-icons/fa6";

import {
  selectGameStatus,
  selectHostPlayerId,
  selectLocalGame,
  selectScores,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./Players.module.scss";
import Button from "common/components/ui/Button/index.js";
import {
  ROUND_RESULTS,
  GUESSING,
  VOTING,
  LOBBY,
} from "utils/generals/constants.js";

import { useStartNewRound } from "hooks/useStartNewRound.js";
import { useTranslation } from "react-i18next";

export default function Players({
  isActiveScreen,
  setMiddleButton,
  startVoting,
  finishRound,
}) {
  const { t } = useTranslation();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectLocalGame(gameId));
  const { players: gamePlayers } = currentGame;

  const storytellerId = useSelector(selectStorytellerId(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));

  const scores = useSelector(selectScores(gameId));
  const gameStatus = useSelector(selectGameStatus(gameId));

  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);

  const isStartVotingDisabled = gamePlayers.some(player => !player.isGuessed);
  const isCurrentPlayerHost = hostPlayerId === playerId;
  const isReadyToStartNewRound = gameStatus === ROUND_RESULTS;

  const startNewRound = useStartNewRound(gameId);

  //* setMiddleBtton
  useEffect(() => {
    if (!isActiveScreen) return;

    if (gameStatus === GUESSING) {
      if (isCurrentPlayerHost && isReadyToVote) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={t("start_voting")}
            onClick={startVoting}
            disabled={isStartVotingDisabled}
          />,
        );
      } else setMiddleButton(null);
    } else if (gameStatus === VOTING) {
      if (isCurrentPlayerHost && isReadyToCalculatePoints) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={t("finish_round")}
            onClick={finishRound}
          />,
        );
      } else setMiddleButton(null);
    } else if (gameStatus === ROUND_RESULTS) {
      if (isCurrentPlayerHost && isReadyToStartNewRound) {
        // console.log("це хост і можна починати новий раунд");
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={t("start_new_round")}
            onClick={startNewRound}
          />,
        );
      }
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
    playerId,
    isCurrentPlayerHost,
    isReadyToStartNewRound,
    startNewRound,
    t,
  ]);

  const getIconOfPlayerState = (player, playerScore) => {
    if (!player) {
      console.log(" getIconOfPlayerState >> player нема повертаюсь:::", player);
      return;
    }

    if (gameStatus === LOBBY) {
      return <div className={css.waiting} />;
    } else if (gameStatus === ROUND_RESULTS) {
      if (player._id === storytellerId) {
        return (
          <>
            <FaCircle className={css.storyteller} />
            <span
              className={css.storytellerWrapper}
              style={{ "--color": "#fff" }}>
              {playerScore}
            </span>
          </>
        );
      } else {
        return (
          <span
            className={css.storytellerWrapper}
            style={{ "--color": "#5D7E9E" }}>
            {playerScore}
          </span>
        );
      }
    } else {
      if (player._id === storytellerId)
        return <FaCircleCheck className={css.storyteller} />;
      else if (
        (gameStatus === GUESSING && !player.isGuessed) ||
        (gameStatus === VOTING && !player.isVoted)
      ) {
        return (
          // <CgSpinnerTwoAlt className={css.spin} />
          <div className={css.waiting} />
        );
      } else return <FaCheck className={css.guessed} />;
    }
  };

  return (
    <>
      {/* <p>Players</p> */}

      <ul className={css.playersList}>
        {gamePlayers.map(player => {
          const maxScore = Math.max(...Object.values(scores)); // Максимальний бал для цього раунду
          const playerScore = scores[player._id] || 0; // Бал поточного гравця
          const fillPercentage =
            maxScore > 0 ? (playerScore / maxScore) * 100 : 0; // Відсоток замальовки для поточного гравця

          return (
            <li
              className={css.player}
              key={player._id}
              style={
                isActiveScreen
                  ? {
                      "--fill-percentage": `${fillPercentage}%`,
                    }
                  : {
                      "--fill-percentage": `0%`,
                    }
              }>
              <div>
                {player.name.toUpperCase()}
                {hostPlayerId === player._id && " (THE HOST)"}
              </div>

              <div className={css.playerState}>
                {getIconOfPlayerState(player, playerScore)}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
