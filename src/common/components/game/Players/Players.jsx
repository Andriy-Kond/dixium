// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { selectLocalGame, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import {
  ROUND_RESULTS,
  GUESSING,
  VOTING,
  LOBBY,
  FINISH,
} from "utils/generals/constants.js";

import { useStartNewRound } from "hooks/useStartNewRound.js";
import { useTranslation } from "react-i18next";

import { MdCheckCircle, MdDone, MdCached, MdStar } from "react-icons/md";
import css from "./Players.module.scss";

export default function Players({
  isActiveScreen,
  setMiddleButton,
  startVoting,
  finishRound,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectLocalGame(gameId));
  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  const startNewRound = useStartNewRound(gameId);

  //* setMiddleBtton
  useEffect(() => {
    if (!isActiveScreen) return;
    if (!currentGame) return;
    const { gameStatus, hostPlayerId, players } = currentGame;

    const isReadyToVote = !players.some(player => !player.isGuessed);
    const isReadyToCalculatePoints = players.every(player => player.isVoted);
    const isStartVotingDisabled = players.some(player => !player.isGuessed);
    const isCurrentPlayerHost = hostPlayerId === playerId;
    const isReadyToStartNewRound = gameStatus === ROUND_RESULTS;

    if (gameStatus === GUESSING) {
      if (isCurrentPlayerHost && isReadyToVote) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
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
          <Button btnText={t("finish_round")} onClick={finishRound} />,
        );
      } else setMiddleButton(null);
    } else if (gameStatus === ROUND_RESULTS) {
      if (isCurrentPlayerHost && isReadyToStartNewRound) {
        // console.log("це хост і можна починати новий раунд");
        setMiddleButton(
          <Button
            btnText={t("start_new_round")}
            onClick={startNewRound}
            disabled={gameStatus === FINISH}
          />,
        );
      }
    } else setMiddleButton(null);
  }, [
    currentGame,
    finishRound,
    isActiveScreen,
    playerId,
    setMiddleButton,
    startNewRound,
    startVoting,
    t,
  ]);

  const getIconOfPlayerState = (player, playerScore) => {
    if (!player) {
      console.log(" getIconOfPlayerState >> player нема повертаюсь:::", player);
      return;
    }

    if (!currentGame) return;
    const { gameStatus, storytellerId } = currentGame;

    if (gameStatus === LOBBY) {
      // return <div className={css.waiting} />;
      return <MdCached className={css.waiting} />;
    } else if (gameStatus === ROUND_RESULTS) {
      if (player._id === storytellerId) {
        return (
          <>
            {/* <FaCircle className={css.storyteller} /> */}
            <span
              className={css.storytellerWrapper}
              // style={{ "--color": "#fff" }}
            >
              {playerScore}
            </span>
          </>
        );
      } else {
        return (
          <span
            className={css.storytellerWrapper}
            // style={{ "--color": "#5D7E9E" }}
          >
            {playerScore}
          </span>
        );
      }
    } else {
      if (player._id === storytellerId)
        return <MdCheckCircle className={css.storyteller} />;
      else if (
        (gameStatus === GUESSING && !player.isGuessed) ||
        (gameStatus === VOTING && !player.isVoted)
      ) {
        return (
          // <CgSpinnerTwoAlt className={css.spin} />
          // <div className={css.waiting} />
          <MdCached className={css.waiting} />
        );
      } else {
        if (gameStatus === GUESSING) {
          return <MdDone className={css.guessed} />;
        } else return <MdStar className={css.guessed} />;
      }
    }
  };

  //^ Render
  if (!currentGame) return null;

  const { players, hostPlayerId, scores, finishPoints } = currentGame;
  return (
    <>
      {/* <p>Players</p> */}
      <div className={css.playersContainer}>
        <div className={css.playersTitle}>{t("players_turn")}</div>
        <ul className={css.list}>
          {players.map(player => {
            const maxScore = Math.max(...Object.values(scores)); // Максимальний бал для цього раунду

            const playerScore = scores[player._id] || 0; // Бал поточного гравця
            const fillPercentage =
              maxScore > 0 ? (playerScore / finishPoints) * 100 : 0; // Відсоток замальовки для поточного гравця

            return (
              <li className={css.listItem} key={player._id}>
                <div
                  className={css.pointsScale}
                  style={
                    isActiveScreen
                      ? { "--fill-percentage": `${fillPercentage}%` }
                      : { "--fill-percentage": `0%` }
                  }
                />
                <span className={css.playerName}>
                  {player.name.toUpperCase()}
                  {hostPlayerId === player._id && " (THE HOST)"}
                </span>

                <span className={css.playerState}>
                  {getIconOfPlayerState(player, playerScore)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
