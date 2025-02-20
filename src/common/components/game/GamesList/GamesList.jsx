import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import { useGetAllGamesQuery } from "features/game/gameApi.js";
import { useDispatch, useSelector } from "react-redux";
import css from "./GamesList.module.scss";
import socket from "socket.js";
import { useEffect } from "react";
import {
  addGame,
  addGamesList,
  removeGame,
  updateGame,
} from "features/game/gameSlice.js";
import { Notify } from "notiflix";

export default function GamesList() {
  const dispatch = useDispatch();
  const userCredentials = useSelector(selectUserCredentials);
  const { data: allGames, refetch } = useGetAllGamesQuery();

  useEffect(() => {
    const handleError = err => Notify.failure(err.message);

    const handleDbUpdate = change => {
      // Remove game from Redux if it was been deleted from server not in the app.
      if (change.operationType === "delete") {
        dispatch(removeGame(change.documentKey._id)); // Видаляємо гру з Redux
        refetch(); // Перезапитуємо дані
      }
    };
    const handleNewGame = newGame => {
      dispatch(addGame(newGame));
      refetch();
    };
    const handleGameDeleted = game => {
      if (game?._id) dispatch(removeGame(game._id));
    };
    const handleUpdateGame = game => {
      dispatch(updateGame(game));
    };

    socket.on("error", handleError);
    socket.on("dbUpdateGamesColl", handleDbUpdate);
    socket.on("newGameCreated", handleNewGame);
    socket.on("currentGameWasDeleted", handleGameDeleted);
    socket.on("updateGame", handleUpdateGame);

    return () => {
      socket.off("error", handleError);
      socket.off("dbUpdateGamesColl", handleDbUpdate);
      socket.off("newGameCreated", handleNewGame);
      socket.off("currentGameWasDeleted", handleGameDeleted);
      socket.off("updateGame", handleUpdateGame);
    };
  }, [dispatch, refetch]);

  useEffect(() => {
    if (allGames) {
      dispatch(addGamesList(allGames)); // Записуємо список доступних ігор у стейт
    }
  }, [allGames, dispatch]);

  const startOrJoinToGame = game => {
    socket.emit("startOrJoinToGame", {
      gameId: game._id,
      player: userCredentials,
    });
  };

  const removeCurrentGame = async gameId => {
    socket.emit("deleteGame", gameId);
  };

  return (
    <ul>
      {allGames?.map(game => {
        return (
          <li key={game._id} className={css.item}>
            <img src={game.gameTitle} alt="Game title" className={css.img} />
            <div className={css.wrapper}>
              <p>{game.gameName}</p>
              <p>Host: {game.hostPlayerName}</p>
              <div className={css.btnsContainer}>
                <Button
                  btnText={
                    userCredentials.userId === game.hostPlayerId
                      ? "Start game"
                      : `Join to ${game.hostPlayerName}'s game`
                  }
                  onClick={() => {
                    startOrJoinToGame(game);
                  }}
                  disabled={false}
                />
                {userCredentials.userId === game.hostPlayerId && (
                  <Button
                    btnText="Delete game"
                    onClick={() => removeCurrentGame(game._id)}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
