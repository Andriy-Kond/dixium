import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useGetAllGamesQuery } from "redux/game/gameApi.js";
import { selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import { addGamesList } from "redux/game/gameSlice.js";
import socket from "servises/socket.js";
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
                <img
                  src={game.gamePoster}
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
                          : game.isGameRunning
                          ? `Game running`
                          : `Join to ${game.hostPlayerName}'s game`
                      }
                      onClick={() => {
                        startOrJoinToGame(game);
                      }}
                      disabled={
                        (game.isGameRunning &&
                          !game.players.find(
                            p => p._id === userCredentials._id,
                          )) ||
                        (!game.isGameStarted &&
                          userCredentials._id !== game.hostPlayerId) // disabled when it is not creator button (i.e. Join to) and game not started
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
