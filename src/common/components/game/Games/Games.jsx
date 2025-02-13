import Button from "common/components/Button/index.js";
import { useGetAllGamesQuery } from "features/game/gameApi.js";

export default function Games() {
  const { data: allGames } = useGetAllGamesQuery();

  const startGame = () => {};

  const btnText = "Приєднатись до гри";
  return (
    <>
      <ul>
        {allGames?.map(game => {
          return (
            <li key={game._id}>
              <p>{game.gameName}</p>
              <Button btnText={btnText} onClick={startGame}></Button>
              <img src={game.deck[0].url} alt="Game title" />
            </li>
          );
        })}
      </ul>
    </>
  );
}
