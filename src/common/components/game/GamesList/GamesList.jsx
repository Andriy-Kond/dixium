import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import socket from "services/socket.js";
import { useGetCurrentGameQuery } from "redux/game/gameApi.js";
import { setLocalGame } from "redux/game/localPersonalSlice.js";
import {
  selectFoundGameId,
  selectLocalGame,
  selectLocalGames,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import ImgGen from "common/components/ui/ImgGen";
import css from "./GamesList.module.scss";

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

  const userActiveGameId = useSelector(selectUserActiveGameId);
  const { data: activeGame, isFetching: isFetchingCurrentGame } =
    useGetCurrentGameQuery(userActiveGameId, {
      skip: !userActiveGameId || userActiveGameId === "",
    });

  useEffect(() => {
    if (activeGame) {
      // dispatch(addLocalGamesList({ activeGame })); // Записуємо список доступних ігор у стейт
      dispatch(setLocalGame(activeGame));
    }
  }, [activeGame, dispatch]);

  const games = useSelector(selectLocalGames); // більш актуальні дані, ніж з сирих allGames
  const foundGameId = useSelector(selectFoundGameId);
  const foundGame = useSelector(selectLocalGame(foundGameId));
  // const currentGame = foundGame || activeGame;

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
    socket.emit("Game:Delete", { gameId, userId: userCredentials._id });
  };

  return (
    <>
      {Object.keys(games).length > 0 && (
        <ul>
          {Object.values(games)?.map(game => {
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
