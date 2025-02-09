import css from "./GameList.module.scss";

export default function GameList() {
  return (
    <>
      <p className={css.gameTitle}>Games</p>
      <ul className={css.gameList}>
        <li className={css.game}></li>
      </ul>
    </>
  );
}
