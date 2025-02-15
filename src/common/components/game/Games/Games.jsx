import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import {
  useGetAllGamesQuery,
  useRemoveGameByApiMutation,
  useRemoveGameMutation,
} from "features/game/gameApi.js";
import { useDispatch, useSelector } from "react-redux";
import css from "./Games.module.scss";
import socket from "socket.js";
import { useEffect } from "react";
import { addGame, addGamesList, removeGame } from "features/game/gameSlice.js";

export default function Games() {
  const dispatch = useDispatch();
  const { data: allGames, refetch } = useGetAllGamesQuery();
  const [removeGameByApi] = useRemoveGameByApiMutation();

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

  // useEffect(() => {
  //   socket.on("dbUpdate", change => {
  //     console.log("Отримано оновлення з БД:", change);
  //     dispatch(updateGamesCollectionInMongoDb(change)); // Оновлення Redux-стану
  //   });

  //   refetch();
  //   return () => {
  //     socket.off("dbUpdate");
  //   };
  // }, [dispatch, refetch]);

  useEffect(() => {
    socket.on("dbUpdate", change => {
      console.log("Отримано оновлення з БД:", change);

      if (change.operationType === "delete") {
        dispatch(removeGame(change.documentKey._id)); // Видаляємо гру за `_id`
      }
      // else {
      //   dispatch(updateGamesCollectionInMongoDb(change)); // Оновлюємо список, якщо це не видалення
      // }

      refetch(); // Перезапитуємо дані
    });

    return () => {
      socket.off("dbUpdate");
    };
  }, [dispatch, refetch]);

  const userCredentials = useSelector(selectUserCredentials);

  const startGame = () => {};

  // dispatch(removeGame(gameId));
  // refetch();
  const removeCurrentGame = async gameId => {
    console.log("Games >> gameId:::", gameId);
    await removeGameByApi(gameId);
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
              <Button
                localClassName={css.button}
                btnText={
                  userCredentials.userId === game.hostPlayerId
                    ? "Start my game"
                    : `Join to ${game.hostPlayerName}'s game`
                }
                onClick={startGame}
                disabled={false}
              />
              <Button
                localClassName={css.button}
                btnText="Delete game"
                disabled={!(userCredentials.userId === game.hostPlayerId)}
                onClick={() => removeCurrentGame(game._id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
