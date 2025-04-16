import { useSelector } from "react-redux";
import socket from "services/socket.js";
import Button from "common/components/ui/Button/index.js";
import css from "./GameSearchResult.module.scss";

import ImgGen from "common/components/ui/ImgGen";
import { selectUserCredentials } from "redux/selectors/selectorsAuthSlice.js";
import {
  selectGame,
  selectIsPlayerGuessed,
  selectIsPlayerVoted,
} from "redux/selectors/selectorsGameSlice.js";
import { useTranslation } from "react-i18next";

export default function GameSearchResult() {
  const { t } = useTranslation();
  const activeGame = useSelector(selectGame);
  const userCredentials = useSelector(selectUserCredentials);
  const { name, avatarURL, _id: playerId, playerGameId } = userCredentials;
  const isPlayerGuessed = useSelector(selectIsPlayerGuessed(playerId));
  const isPlayerVoted = useSelector(selectIsPlayerVoted(playerId));

  const isCurrentPlayerHost = activeGame.hostPlayerId === playerId;
  const isPlayerInGame = activeGame.players.some(p => p._id === playerId);

  const startOrJoinToGame = () => {
    socket.emit("startOrJoinToGame", {
      gameId: activeGame._id,
      player: {
        _id: playerId,
        name: name,
        avatarURL: avatarURL,
        hand: [],
        isGuessed: isPlayerInGame ? isPlayerGuessed : false,
        isVoted: isPlayerInGame ? isPlayerVoted : false,
      },
    });
  };

  const removeCurrentGame = () => {
    socket.emit("deleteGame", { gameId: activeGame._id });
  };

  //^ Render
  if (!activeGame) {
    return <p className={css.placeholder}>{t("no_game_found")}</p>;
  }

  return (
    <>
      <div className={css.item}>
        <ImgGen className={css.img} publicId={activeGame.gamePoster} />
        <div className={css.wrapper}>
          <p>{activeGame.gameName.toUpperCase()}</p>
          <p>
            {`${t("host", {
              hostPlayerName: activeGame.hostPlayerName.toUpperCase(),
            })} (${playerGameId})`}
          </p>
          <div className={css.btnsContainer}>
            <Button
              btnText={
                isCurrentPlayerHost
                  ? t("start_game")
                  : activeGame.isGameRunning
                  ? t("game_running")
                  : t("join_to_game", {
                      hostPlayerName: activeGame.hostPlayerName,
                    })
              }
              onClick={startOrJoinToGame}
              disabled={
                // disabled when it is not creator button (i.e. Join to) and game not started
                (activeGame.isGameRunning && !isPlayerInGame) ||
                (!activeGame.isGameStarted && !isCurrentPlayerHost)
              }
            />
            {isCurrentPlayerHost && (
              <Button btnText={t("delete_game")} onClick={removeCurrentGame} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
