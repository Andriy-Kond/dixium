import { selectCurrentGameId, selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import {
  gameApi,
  useGetAllGamesQuery,
  useUpdateCurrentGameQuery,
} from "features/game/gameApi.js";
import { useDispatch, useSelector } from "react-redux";
import css from "./GamesList.module.scss";
import socket from "socket.js";
import { useEffect } from "react";
import {
  // addGame,
  addGamesList,
  // setCurrentGame,
  setCurrentGameId,
  // removeGame,
  updateGame,
} from "features/game/gameSlice.js";
import { Notify } from "notiflix";
import { useLocation, useNavigate } from "react-router-dom";

export default function GamesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // const currentGameId = useSelector(selectCurrentGameId);
  const userCredentials = useSelector(selectUserCredentials);
  const { data: allGames, refetch: refetchAllGames } = useGetAllGamesQuery();

  useEffect(() => {
    const handleError = err => Notify.failure(err.message);

    // const handleDbUpdate = change => {
    //   // Remove game from Redux if it was been deleted from server not in the app.
    //   if (change.operationType === "delete") {
    //     dispatch(removeGame(change.documentKey._id)); // Видаляємо гру з Redux
    //     refetchAllGames(); // Перезапитуємо дані
    //   }
    // };

    const handleNewGame = () => {
      refetchAllGames();
    };

    const handleGameDeleted = () => {
      refetchAllGames();
      dispatch(setCurrentGameId(null));
    };

    const handleUpdateGame = game => {
      console.log("useEffect >> game:::", game);
      if (game) {
        dispatch(updateGame(game));

        // updata Redux state:
        refetchAllGames();
        // or:
        // handle change of gameApi without refetchAllGames()
        // dispatch(
        //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
        //     const index = draft.findIndex(g => g._id === game._id);
        //     if (index !== -1) {
        //       draft[index] = game; // Оновлюємо конкретну гру
        //     }
        //   }),
        // );
      }
    };

    const handlePlayerJoined = data => {
      // dispatch(setCurrentGameId(data.game._id));
      // console.log("handlePlayerJoined >> data:::", data);
      if (data) navigate(`/game/${data.game._id}`);
      // navigate(`/game/${data.game._id}`, { replace: true });
    };

    socket.on("error", handleError);
    // socket.on("dbUpdateGamesColl", handleDbUpdate);
    socket.on("newGameCreated", handleNewGame);
    socket.on("currentGameWasDeleted", handleGameDeleted);
    socket.on("updateGame", handleUpdateGame);
    socket.on("playerJoined", handlePlayerJoined); // send user to GameStartedPage page

    return () => {
      socket.off("error", handleError);
      // socket.off("dbUpdateGamesColl", handleDbUpdate);
      socket.off("newGameCreated", handleNewGame);
      socket.off("currentGameWasDeleted", handleGameDeleted);
      socket.off("updateGame", handleUpdateGame);
      socket.off("playerJoined", handlePlayerJoined);
    };
  }, [dispatch, navigate, refetchAllGames]);

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
                    userCredentials._id === game.hostPlayerId
                      ? "Start game"
                      : `Join to ${game.hostPlayerName}'s game`
                  }
                  onClick={() => {
                    startOrJoinToGame(game);
                  }}
                  disabled={
                    !game.isGameStarted &&
                    userCredentials._id !== game.hostPlayerId // disabled when it is not creator button (i.e. Join to) and game not started
                  }
                />
                {userCredentials._id === game.hostPlayerId && (
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
