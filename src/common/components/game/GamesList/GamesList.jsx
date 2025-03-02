import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useGetAllGamesQuery } from "features/game/gameApi.js";
import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import { addGamesList } from "features/game/gameSlice.js";
import socket from "socket.js";
import css from "./GamesList.module.scss";

export default function GamesList() {
  const dispatch = useDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const { data: allGames, isFetching } = useGetAllGamesQuery();

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
    <>
      {!isFetching && (
        <ul>
          {allGames?.map(game => {
            return (
              <li key={game._id} className={css.item}>
                <img
                  src={game.gameTitle}
                  alt="Game title"
                  className={css.img}
                />
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
      )}
    </>
  );
}
