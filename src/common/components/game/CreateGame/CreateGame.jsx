import css from "../game.module.scss";
import GameList from "common/components/game/GameList";

export default function CreateGame() {
  // const games =
  return (
    <>
      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>AVAILABLE GAMES</p>
        </div>

        <div className={css.pageMain}>
          <GameList></GameList>

          <div className={css.bottomBar}>
            <button className={css.buttonPrimary} type="submit">
              CREATE GAME
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
