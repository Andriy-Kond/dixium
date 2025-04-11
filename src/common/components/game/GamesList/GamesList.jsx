import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useGetAllGamesQuery } from "redux/game/gameApi.js";
import { selectAllGames, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import { addGamesList } from "redux/game/gameSlice.js";
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
  } = userCredentials;

  const { data: allGames, isFetching } = useGetAllGamesQuery();
  const games = useSelector(selectAllGames); // більш актуальні дані, ніж з сирих allGames

  useEffect(() => {
    if (allGames) {
      dispatch(addGamesList(allGames)); // Записуємо список доступних ігор у стейт
    }
  }, [allGames, dispatch]);

  const startOrJoinToGame = game => {
    const currentGame = games[game._id];

    const isPlayerInGame = currentGame.players.some(
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
      {!isFetching && (
        <ul>
          {/* //# якщо games - це масив: */}
          {/* {allGames?.map(game => { */}
          {/* //# якщо games - це об'єкт: */}
          {Object.values(allGames)?.map(game => {
            return (
              <li key={game._id} className={css.item}>
                <ImgGen className={css.img} publicId={game.gamePoster} />

                <div className={css.wrapper}>
                  <p>{game.gameName.toUpperCase()}</p>
                  <p>
                    {t("host", {
                      hostPlayerName: game.hostPlayerName.toUpperCase(),
                    })}
                  </p>
                  <div className={css.btnsContainer}>
                    <Button
                      btnText={
                        playerId === game.hostPlayerId
                          ? t("start_game")
                          : game.isGameRunning
                          ? t("game_running")
                          : t("join_to_game", {
                              hostPlayerName: game.hostPlayerName,
                            })
                      }
                      onClick={() => {
                        startOrJoinToGame(game);
                      }}
                      disabled={
                        (game.isGameRunning &&
                          !game.players.find(p => p._id === playerId)) ||
                        (!game.isGameStarted && playerId !== game.hostPlayerId) // disabled when it is not creator button (i.e. Join to) and game not started
                      }
                    />
                    {playerId === game.hostPlayerId && (
                      <Button
                        btnText={t("delete_game")}
                        onClick={() => removeCurrentGame(game._id)}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
