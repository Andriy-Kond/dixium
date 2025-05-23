import clsx from "clsx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectActiveScreen,
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectLocalGame,
  selectUserCredentials,
} from "redux/selectors.js";
import { GUESSING, VOTING } from "utils/generals/constants.js";

import css from "./ParagraphText.module.scss";
import { useTranslation } from "react-i18next";

export default function ParagraphText() {
  const { gameId } = useParams();
  const { t } = useTranslation();
  const currentGame = useSelector(selectLocalGame(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );
  const isCarouselModeTableScreen = useSelector(
    selectIsCarouselModeTableScreen(gameId, playerId),
  );
  const activeScreen = useSelector(selectActiveScreen(gameId, playerId)); // Number of current active screen
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

  if (!currentGame) return null;

  const { players, storytellerId, gameStatus } = currentGame;
  const storyteller = players.find(p => p._id === storytellerId);
  const isCurrentPlayerStoryteller = storytellerId === playerId;

  const currentPlayer = players.find(p => p._id === playerId) || [];
  const { isGuessed, isVoted } = currentPlayer;

  // * paragraphText
  let paragraphText = "";

  const decisionTable = {
    lobby_hand_openHand: `Очікуйте поки ${storyteller?.name} розкаже свою асоціацію`,
    lobby_players: "lobby_players",
    lobby_table_openTable: "lobby_table_openTable",
    lobby_close: `Очікуйте поки ${storyteller?.name} розкаже свою асоціацію`,

    notGuessing_hand_openHand: `Підберіть карту до асоціації ${storyteller?.name} і походіть нею`,
    notGuessing_players: "notGuessing_players",
    notGuessing_table_openTable: "notGuessing_table_openTable",
    notGuessing_close: `Підберіть карту до асоціації ${storyteller?.name} і походіть нею`,

    notVoting_hand_openHand: "notVoting_hand_openHand",
    notVoting_players: "notVoting_players",
    notVoting_table_openTable: `Підберіть карту до асоціації ${storyteller?.name} і походіть нею`,
    notVoting_close: `Позначте зірочками карти, що можуть належати ${storyteller?.name}. Якщо впевнені - ставте одразу дві зірки`,

    round_results_hand_openHand: "round_results_hand_openHand",
    round_results_players: "round_results_players",
    round_results_table_openTable: "round_results_table_openTable",
    round_results_close: "round_results_close",

    waiting: "Очікуйте поки решта гравців походить",
  };

  function handleGameState(
    gameStatus,
    activeScreen,
    isCarouselModeHandScreen,
    isCarouselModeTableScreen,
  ) {
    // Hand - 0, Players - 1, Table - 2
    const screen =
      activeScreen === 0 ? "hand" : activeScreen === 1 ? "players" : "table";

    const carouselState = isCarouselModeHandScreen
      ? "openHand"
      : isCarouselModeTableScreen
      ? "openTable"
      : "close";

    let state = gameStatus;
    if (gameStatus === GUESSING) state = isGuessed ? "waiting" : "notGuessing";
    if (gameStatus === VOTING) state = isVoted ? "waiting" : "notVoting";

    let key = "";
    if (state === "waiting") {
      key = "waiting";
    } else if (!isCarouselModeHandScreen && !isCarouselModeTableScreen) {
      key = `${state}_${carouselState}`;
    } else if (screen === "players") {
      key = `${state}_${screen}`;
    } else {
      key = `${state}_${screen}_${carouselState}`;
    }

    // console.log(" ParagraphText >> key:::", key);
    return decisionTable[key] || "Невідома комбінація";
  }

  if (!storytellerId) {
    paragraphText =
      "Придумайте асоціацію до карти і оберіть її. Розкажіть гравцям асоціацію вголос.";
  } else if (isShowMask && !isCurrentPlayerStoryteller) {
    paragraphText = t("player_told_first_story", {
      storytellerName: storyteller?.name,
    });
  } else if (isCurrentPlayerStoryteller) {
    paragraphText =
      isVoted && isGuessed
        ? "Очікуйте поки решта гравців походить"
        : "Придумайте асоціацію до карти і оберіть її. Розкажіть гравцям асоціацію вголос.";
  } else {
    paragraphText = handleGameState(
      gameStatus,
      activeScreen,
      isCarouselModeHandScreen,
      isCarouselModeTableScreen,
    );
  }

  const isHightLight =
    !storytellerId ||
    isShowMask ||
    (isCurrentPlayerStoryteller && !isGuessed && !isVoted) ||
    (gameStatus === GUESSING && !isGuessed) ||
    (gameStatus === VOTING && !isVoted && isCarouselModeTableScreen) ||
    (gameStatus === VOTING && !isVoted && activeScreen === 2);

  // // Carousel in Hand
  // if (isCarouselModeHandScreen) {
  //   if (gameStatus === GUESSING && !isGuessed) {
  //     paragraphText =
  //       "Підберіть карту до асоціації [Nick 2] і зробить оберіть її.";
  //   }
  //   if (gameStatus === VOTING && !isVoted) {
  //     if (activeScreen === 2) {
  //       // 2 - table screen
  //       paragraphText = `Підберіть карту до асоціації ${storyteller.name} і оберіть її.`;
  //     } else {
  //       paragraphText = "Очікуйте поки решта гравців проголосують.";
  //     }
  //   } else if (gameStatus === VOTING && isVoted) {
  //     paragraphText = "Очікуйте поки решта гравців проголосують.";
  //   }
  // }

  // // Carousel in Table
  // if (isCarouselModeTableScreen) {
  //   if (gameStatus === GUESSING && !isGuessed) {
  //     paragraphText =
  //       "Підберіть карту до асоціації [Nick 2] і зробить оберіть її.";
  //   }
  //   if (gameStatus === VOTING && !isVoted) {
  //     if (activeScreen === 2) {
  //       // 2 - table screen
  //       paragraphText = `Підберіть карту до асоціації ${storyteller.name} і оберіть її.`;
  //     } else {
  //       paragraphText = "Очікуйте поки решта гравців проголосують.";
  //     }
  //   } else if (gameStatus === VOTING && isVoted) {
  //     paragraphText = "Очікуйте поки решта гравців проголосують.";
  //   }
  // }

  // // Non carousel
  // if (!isCarouselModeHandScreen && !isCarouselModeTableScreen) {
  //   // Hand
  //   if (activeScreen === 0) {
  //   }

  //   // Players
  //   if (activeScreen === 1) {
  //   }

  //   // Table
  //   if (activeScreen === 2) {
  //   }

  //   if (gameStatus === GUESSING && !isGuessed) {
  //     paragraphText = `Підберіть карту до асоціації ${storyteller.name} і зробить оберіть її.`;
  //   }

  //   if (gameStatus === VOTING && !isVoted) {
  //     if (activeScreen === 2) {
  //       // 2 - table screen
  //       paragraphText = `Позначте зірочками карти, що можуть належати ${storyteller.name}. Якщо впевнені - ставте одразу дві зірки.`;
  //     } else {
  //       paragraphText = "";
  //     }
  //   } else if (gameStatus === VOTING && isVoted) {
  //     paragraphText = "Очікуйте поки решта гравців проголосують.";
  //   }
  // }

  return (
    <>
      {!(gameStatus === VOTING && !isVoted && activeScreen !== 2) && (
        <p
          className={clsx(css.headerMessage, {
            [css.hightLight]: isHightLight,
          })}>
          {paragraphText}
        </p>
      )}
    </>
  );
}
