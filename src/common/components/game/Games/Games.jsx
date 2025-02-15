import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import { useGetAllGamesQuery } from "features/game/gameApi.js";
import { useDispatch, useSelector } from "react-redux";
import css from "./Games.module.scss";
import socket from "socket.js";
import { useEffect } from "react";
import { addGame } from "features/game/gameSlice.js";

export default function Games() {
  const dispatch = useDispatch();
  const { data: allGames, refetch } = useGetAllGamesQuery();

  useEffect(() => {
    socket.on("newGameCreated", async newGame => {
      dispatch(addGame(newGame));
      refetch();
    });

    return () => {
      socket.off("newGameCreated");
    };
  }, [dispatch, refetch]);

  const userCredentials = useSelector(selectUserCredentials);

  const startGame = () => {};

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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
