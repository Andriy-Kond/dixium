import { selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import { useGetAllGamesQuery } from "features/game/gameApi.js";
import { useSelector } from "react-redux";
import css from "./Games.module.scss";

export default function Games() {
  const { data: allGames } = useGetAllGamesQuery();
  const userCredentials = useSelector(selectUserCredentials);

  const startGame = () => {};

  // const btnText = "Join to game";
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
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
