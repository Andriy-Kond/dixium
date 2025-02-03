import css from "../game.module.scss";

export default function CreateGame() {
  return (
    <>
      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>AVAILABLE GAMES</p>
        </div>

        <div className={css.pageMain}>
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
