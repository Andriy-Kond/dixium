import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";

import { useGetAllGamesQuery } from "features/game/gameApi.js";
import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import { addGamesList, updateGame } from "features/game/gameSlice.js";
import socket from "socket.js";
import css from "./GamesList.module.scss";

export default function GamesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const {
    data: allGames,
    refetch: refetchAllGames,
    currentData,
    error,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    isError,
  } = useGetAllGamesQuery();
  // data - The latest returned result regardless of hook arg, if present.
  // currentData - The latest returned result for the current hook arg, if present.
  // error - The error result if present.
  // isUninitialized - When true, indicates that the query has not started yet.
  // isLoading - When true, indicates that the query is currently loading for the first time, and has no data yet. This will be true for the first request fired off, but not for subsequent requests.
  // isFetching - When true, indicates that the query is currently fetching, but might have data from an earlier request. This will be true for both the first request fired off, as well as subsequent requests.
  // isSuccess - When true, indicates that the query has data from a successful request.
  // isError - When true, indicates that the query is in an error state.
  // refetch - A function to force refetch the query

  useEffect(() => {
    const handleError = err => Notify.failure(err.message);

    const handleNewGame = () => {
      refetchAllGames();
    };

    const handleUpdateGame = game => {
      if (game) {
        dispatch(updateGame(game));

        // update Redux state:
        refetchAllGames();
        // or handle change of gameApi without refetchAllGames():
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

    socket.on("error", handleError);
    socket.on("newGameCreated", handleNewGame);
    socket.on("updateGame", handleUpdateGame);

    return () => {
      socket.off("error", handleError);
      socket.off("newGameCreated", handleNewGame);
      socket.off("updateGame", handleUpdateGame);
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
