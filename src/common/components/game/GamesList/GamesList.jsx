import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useGetAllGamesQuery } from "redux/game/gameApi.js";
import { selectAllGames, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import { addGamesList } from "redux/game/gameSlice.js";
import socket from "services/socket.js";
import css from "./GamesList.module.scss";

export default function GamesList() {
  const dispatch = useDispatch();

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
                <img
                  src={game.gamePoster}
                  alt="game title"
                  className={css.img}
                />
                <div className={css.wrapper}>
                  <p>{game.gameName}</p>
                  <p>Host: {game.hostPlayerName}</p>
                  <div className={css.btnsContainer}>
                    <Button
                      btnText={
                        playerId === game.hostPlayerId
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
                          !game.players.find(p => p._id === playerId)) ||
                        (!game.isGameStarted && playerId !== game.hostPlayerId) // disabled when it is not creator button (i.e. Join to) and game not started
                      }
                    />
                    {playerId === game.hostPlayerId && (
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
