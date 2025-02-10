import { useGetAllDecksQuery } from "features/game/gameApi.js";
import css from "./GameList.module.scss";

export default function GameList() {
  const { data } = useGetAllDecksQuery();
  console.log("GameList >> data:::", data);

  return (
    <>
      <p className={css.gameTitle}>Games</p>
      <ul className={css.gameList}>
        <li className={css.game}></li>
      </ul>
    </>
  );
}
