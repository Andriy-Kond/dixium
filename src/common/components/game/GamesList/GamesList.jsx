// import ImgGen from "common/components/ui/ImgGen";
// import { useTranslation } from "react-i18next";
// import { useGetAllGamesQuery } from "redux/game/gameApi.js";
// import css from "./GamesList.module.scss";

// export default function GamesList() {
//   const { t } = useTranslation();
//   const { data: allGames, isFetching } = useGetAllGamesQuery();

//   //^ Render
//   if (isFetching) {
//     return <p>{t("loading")}</p>;
//   }

//   if (!allGames || allGames.length === 0) {
//     return <p>{t("no_games_available")}</p>;
//   }

//   return (
//     <>
//       <ul className={css.list}>
//         {Object.values(allGames)?.map(game => (
//           <li key={game._id} className={css.item}>
//             <ImgGen className={css.img} publicId={game.gamePoster} />

//             <div className={css.wrapper}>
//               <p>{game.gameName.toUpperCase()}</p>
//               <p>
//                 {`${t("host", {
//                   hostPlayerName: game.hostPlayerName.toUpperCase(),
//                 })} (${game.playerGameId})`}
//               </p>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </>
//   );
// }

// todo додати сюди кнопки для початку і доєднання до гри як і у GameSearchResult
