import clsx from "clsx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  selectActiveScreen,
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectLocalGame,
  selectUserCredentials,
} from "redux/selectors.js";
import {
  GUESSING,
  HAND,
  PLAYERS,
  TABLE,
  VOTING,
} from "utils/generals/constants.js";
import css from "./ParagraphText.module.scss";

// screen states
const OPEN_HAND = "openHand";
const OPEN_TABLE = "openTable";
const CLOSE = "close";

// player states
const WAITING = "waiting";
const NOT_GUESSING = "notGuessing";
const NOT_VOTING = "notVoting";

// // Конфігурація текстів для різних станів
// const TEXT_CONFIG = {
//   lobby: {
//     hand_openHand: (t, name) => t("waiting_tellers_story", { name }),
//     players: "lobby_players",
//     table_openTable: "lobby_table_openTable",
//     close: (t, name) => t("waiting_tellers_story", { name }),
//   },

//   notGuessing: {
//     hand_openHand: (t, name) => t("select_card_make_turn", { name }),
//     players: "notGuessing_players",
//     table_openTable: "notGuessing_table_openTable",
//     close: (t, name) => t("select_card_make_turn", { name }),
//   },

//   notVoting: {
//     hand_openHand: "notVoting_hand_openHand",
//     players: "notVoting_players",
//     table_openTable: (t, name) => t("select_card_make_turn", { name }),
//     close: (t, name) => t("check_cards_one_two_stars", { name }),
//   },

//   round_results: {
//     hand_openHand: "round_results_hand_openHand",
//     players: "round_results_players",
//     table_openTable: "round_results_table_openTable",
//     close: "round_results_close",
//   },

//   waiting: t => t("wait_other_players_turn"),
// };

// Конфігурація текстів для різних станів
const stateMachine = {
  states: {
    lobby: {
      hand: { openHand: (t, name) => t("waiting_tellers_story", { name }) },
      players: () => "lobby_players",
      table: { openTable: () => "lobby_table_openTable" },
      close: (t, name) => t("waiting_tellers_story", { name }),
    },

    notGuessing: {
      hand: { openHand: (t, name) => t("select_card_make_turn", { name }) },
      players: () => "notGuessing_players",
      table: { openTable: () => "notGuessing_table_openTable" },
      close: (t, name) => t("select_card_make_turn", { name }),
    },

    notVoting: {
      hand: { openHand: () => "notVoting_hand_openHand" },
      players: () => "notVoting_players",
      table: { openTable: (t, name) => t("select_card_make_turn", { name }) },
      close: (t, name) => t("check_cards_one_two_stars", { name }),
    },

    round_results: {
      hand: { openHand: () => "round_results_hand_openHand" },
      players: () => "round_results_players",
      table: { openTable: () => "round_results_table_openTable" },
      close: () => "round_results_close",
    },

    waiting: t => t("wait_other_players_turn"),
  },

  getText({ gameState, screenState, carouselState, t, name }) {
    const stateConfig = this.states[gameState] || {};
    const screenConfig = stateConfig[screenState] || {};
    const text =
      screenConfig[carouselState] ||
      stateConfig.close ||
      t("unknown_combination");

    return typeof text === "function" ? text(t, name) : text;
  },
};

export default function ParagraphText() {
  const { gameId } = useParams();
  const { t } = useTranslation();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );
  const isCarouselModeTableScreen = useSelector(
    selectIsCarouselModeTableScreen(gameId, playerId),
  );
  const activeScreen = useSelector(selectActiveScreen(gameId, playerId));
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

  const currentGame = useSelector(selectLocalGame(gameId));
  if (!currentGame) return null;

  const { players, storytellerId, gameStatus } = currentGame;

  const currentPlayer = players.find(p => p._id === playerId);
  if (!currentPlayer) return null;

  const { isGuessed, isVoted } = currentPlayer;

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const storyteller = players.find(p => p._id === storytellerId);
  const name = storyteller?.name;

  // Визначення стану гри
  const getGameState = () => {
    if (gameStatus === GUESSING) return isGuessed ? WAITING : NOT_GUESSING;
    if (gameStatus === VOTING) return isVoted ? WAITING : NOT_VOTING;
    return gameStatus;
  };

  // Визначення стану екрану
  const getScreenState = () => {
    switch (activeScreen) {
      case 0:
        return HAND;
      case 1:
        return PLAYERS;
      case 2:
        return TABLE;
      default:
        return HAND;
    }
  };

  // Визначення стану каруселі
  const getCarouselState = () => {
    if (isCarouselModeHandScreen) return OPEN_HAND;
    if (isCarouselModeTableScreen) return OPEN_TABLE;
    return CLOSE;
  };

  // Отримання тексту для параграфа
  const getParagraphText = () => {
    if (!storytellerId) return t("think_about_association");

    if (isShowMask && !isCurrentPlayerStoryteller)
      return t("player_told_first_story", { name });

    if (isCurrentPlayerStoryteller)
      return isVoted && isGuessed
        ? t("wait_other_players_turn")
        : t("think_about_association");

    const gameState = getGameState();
    const screenState = getScreenState();
    const carouselState = getCarouselState();

    // if (gameState === WAITING) return TEXT_CONFIG.waiting(t);

    // const key =
    //   screenState === PLAYERS
    //     ? `${gameState}_${screenState}`
    //     : `${gameState}_${screenState}_${carouselState}`;

    // const text = TEXT_CONFIG[gameState]?.[key] || t("unknown_combination");

    // return typeof text === "function" ? text(t, name) : text;

    const paragraphText = stateMachine.getText({
      gameState,
      screenState,
      carouselState,
      t,
      name,
    });

    return paragraphText;
  };

  // Визначення, чи потрібно підсвітити текст
  const isHightLight =
    !storytellerId ||
    isShowMask ||
    (isCurrentPlayerStoryteller && !isGuessed && !isVoted) ||
    (gameStatus === GUESSING && !isGuessed) ||
    (gameStatus === VOTING &&
      !isVoted &&
      (isCarouselModeTableScreen || activeScreen === 2));

  return (
    <>
      {!(gameStatus === VOTING && !isVoted && activeScreen !== 2) && (
        <p
          className={clsx(css.headerMessage, {
            [css.hightLight]: isHightLight,
          })}>
          {getParagraphText()}
        </p>
      )}
    </>
  );
}
