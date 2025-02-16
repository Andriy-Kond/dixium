import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import {
  useGetAllGamesQuery,
  // useRemoveGameFromServerMutation,
} from "features/game/gameApi.js";
import { useDispatch, useSelector } from "react-redux";
import css from "./GamesList.module.scss";
import socket from "socket.js";
import { useEffect } from "react";
import { addGame, addGamesList, removeGame } from "features/game/gameSlice.js";

export default function GamesList() {
  const dispatch = useDispatch();
  const { data: allGames, refetch } = useGetAllGamesQuery();
  // const [removeGameFromServer] = useRemoveGameFromServerMutation();

  useEffect(() => {
    if (allGames) {
      dispatch(addGamesList(allGames)); // Записуємо список доступних ігор у стейт
    }
  }, [allGames, dispatch]);

  useEffect(() => {
    socket.on("newGameCreated", async newGame => {
      dispatch(addGame(newGame));
      refetch();
    });

    return () => {
      socket.off("newGameCreated");
    };
  }, [dispatch, refetch]);

  // Remove game from Redux if it was been deleted from server not in the app.
  useEffect(() => {
    socket.on("dbUpdate", change => {
      console.log("useEffect >> change:::", change);
      if (change.operationType === "delete") {
        dispatch(removeGame(change.documentKey._id)); // Видаляємо гру з Redux
        refetch(); // Перезапитуємо дані
      }
    });

    return () => {
      socket.off("dbUpdate");
    };
  }, [dispatch, refetch]);

  useEffect(() => {
    socket.on("gameDeleted", async game => {
      console.log("useEffect >> game:::", game);
      // dispatch(removeGame(game._id));
    });

    return () => {
      socket.off("gameDeleted");
    };
  }, [dispatch]);

  const userCredentials = useSelector(selectUserCredentials);

  const startGame = () => {};

  const removeCurrentGame = async gameId => {
    // await removeGameFromServer(gameId);
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
                  onClick={startGame}
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
