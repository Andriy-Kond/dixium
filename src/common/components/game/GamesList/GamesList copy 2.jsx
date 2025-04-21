import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useGetCurrentGameQuery } from "redux/game/gameApi.js";
import { selectActiveGame, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import { setActiveGame } from "redux/game/gameSlice.js";
import socket from "services/socket.js";
import css from "./GamesList.module.scss";
import { useTranslation } from "react-i18next";

import ImgGen from "common/components/ui/ImgGen";

export default function GamesList() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const userCredentials = useSelector(selectUserCredentials);
  const {
    name,
    avatarURL,
    isGuessed,
    isVoted,
    _id: playerId,
    playerGameId,
  } = userCredentials;
  const foundActiveGame = useSelector(selectActiveGame);

  const hostIdOfFoundActiveGame = foundActiveGame?.hostPlayerId;
  const isCurrentPlayerHost = hostIdOfFoundActiveGame === playerId;

  // const { data: allGames, isFetchingAllGames } = useGetAllGamesQuery();
  const { data: playerGame, isFetchingActiveGame } =
    useGetCurrentGameQuery(playerGameId);

  useEffect(() => {
    if (playerGame) {
      dispatch(setActiveGame(playerGame));
    }
  }, [dispatch, playerGame]);

  const startOrJoinToGame = game => {
    const isPlayerInGame = foundActiveGame.players.some(
      player => player._id === playerId,
    );

    if (isPlayerInGame) {
      socket.emit("startOrJoinToGame", {
        gameId: game._id,
        // player: { ...userCredentials },
        player: {
          _id: playerId,
          name: name,
          avatarURL: avatarURL,
          hand: [],
          isGuessed,
          isVoted,
        },
      });
    } else {
      socket.emit("startOrJoinToGame", {
        gameId: game._id,
        // player: { ...userCredentials, isGuessed: false},
        player: {
          _id: playerId,
          name: name,
          avatarURL: avatarURL,
          hand: [],
          isGuessed: false,
          isVoted: false,
        },
      });
    }
  };

  const removeCurrentGame = async gameId => {
    socket.emit("deleteGame", { gameId });
  };

  return (
    <>
      {foundActiveGame && (
        <div key={foundActiveGame._id} className={css.item}>
          <ImgGen className={css.img} publicId={foundActiveGame.gamePoster} />

          <div className={css.wrapper}>
            <p>{foundActiveGame.gameName.toUpperCase()}</p>
            <p>
              {t("host", {
                hostPlayerName: foundActiveGame.hostPlayerName.toUpperCase(),
              })}
            </p>
            <div className={css.btnsContainer}>
              <Button
                btnText={
                  playerId === foundActiveGame.hostPlayerId
                    ? t("start_game")
                    : foundActiveGame.isGameRunning
                    ? t("game_running")
                    : t("join_to_game", {
                        hostPlayerName: foundActiveGame.hostPlayerName,
                      })
                }
                onClick={() => {
                  startOrJoinToGame(foundActiveGame);
                }}
                disabled={
                  (foundActiveGame.isGameRunning &&
                    !foundActiveGame.players.find(p => p._id === playerId)) ||
                  (!foundActiveGame.isGameStarted &&
                    playerId !== foundActiveGame.hostPlayerId) // disabled when it is not creator button (i.e. Join to) and game not started
                }
              />
              {playerId === foundActiveGame.hostPlayerId && (
                <Button
                  btnText={t("delete_game")}
                  onClick={() => removeCurrentGame(foundActiveGame._id)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
