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

  const { players, storytellerId, gameStatus, hostPlayerId } = currentGame;
  const storyteller = players.find(p => p._id === storytellerId);
  const name = storyteller?.name;

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const currentPlayer = players.find(p => p._id === playerId) || [];
  const { isGuessed, isVoted } = currentPlayer;
  const isCurrentPlayerHost = playerId === hostPlayerId;

  const OPEN_HAND = "openHand";
  const OPEN_TABLE = "openTable";
  const CLOSE = "close";
  const WAITING = "waiting";
  const NOT_GUESSING = "notGuessing";
  const NOT_VOTING = "notVoting";
  const PLAYERS_QTY = players.length > 3 ? "moreThree" : "lessThree";

  let paragraphText = "";
  let isHightLight = false;
  // "waiting_tellers_story": "Очікуйте поки {{name}} розкаже свою асоціацію",
  // "select_card_make_turn": "Підберіть карту до асоціації {{name}} і походіть нею",
  // "select_two_cards": "Підберіть дві карти до асоціації {{name}}",
  // "check_cards_one_two_stars": "Позначте зірочками карти, що можуть належати {{name}}. Якщо впевнені - ставте одразу дві зірки",
  // "wait_other_players_turn": "Очікуйте поки решта гравців походить",
  const decisionTable = {
    lobby_hand_openHand_moreThree: t("waiting_tellers_story", { name }),
    // lobby_players: "__lobby_players",
    // lobby_table_openTable_moreThree: "__lobby_table_openTable_moreThree",
    lobby_close_moreThree: t("waiting_tellers_story", { name }),

    lobby_hand_openHand_lessThree: t("waiting_tellers_story", { name }),
    lobby_close_lessThree: t("waiting_tellers_story", { name }),

    notGuessing_hand_openHand_moreThree: t("select_card_make_turn", { name }),
    // notGuessing_players: "__notGuessing_players",
    // notGuessing_table_openTable_moreThree: "__notGuessing_table_openTable_moreThree",
    notGuessing_close: t("select_card_make_turn", { name }),

    notGuessing_hand_openHand_lessThree: t("select_two_cards", { name }),
    notGuessing_close_lessThree: t("select_two_cards", { name }),

    // notVoting_hand_openHand_moreThree: "__notVoting_hand_openHand_moreThree",
    // notVoting_players: "__notVoting_players",
    notVoting_table_openTable_moreThree: t("check_cards_one_two_stars", {
      name,
    }),
    notVoting_close_moreThree: t("check_cards_one_two_stars", { name }),

    notVoting_table_openTable_lessThree: t("check_card_by_one_star", { name }),
    notVoting_close_lessThree: t("check_card_by_one_star", { name }),

    // round_results_hand_openHand_moreThree: "__round_results_hand_openHand_moreThree",
    // round_results_players_moreThree: "__round_results_players_moreThree",
    // round_results_table_openTable_moreThree: "__round_results_table_openTable_moreThree",
    // round_results_close_moreThree: "__round_results_close_moreThree",

    waiting: t("wait_other_players_turn"),
  };

  // Визначення стану гри
  const getGameState = () => {
    if (gameStatus === GUESSING) return isGuessed ? WAITING : NOT_GUESSING;
    if (gameStatus === VOTING) return isVoted ? WAITING : NOT_VOTING;
    return gameStatus;
  };

  // Визначення стану екрану (Hand - 0, Players - 1, Table - 2)
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

  function findParagraphText() {
    const gameState = getGameState();
    const screenState = getScreenState();
    const carouselState = getCarouselState();

    let key = "";

    if (gameState === WAITING) {
      key = WAITING; // "waiting"
    }

    if (gameState !== WAITING) {
      if (!isCarouselModeHandScreen && !isCarouselModeTableScreen) {
        key = `${gameState}_${carouselState}_${PLAYERS_QTY}`;
      } else if (screenState === PLAYERS) {
        key = `${gameState}_${screenState}`;
      } else {
        key = `${gameState}_${screenState}_${carouselState}_${PLAYERS_QTY}`;
      }
    }

    // console.log("ParagraphText >> key:::", key);
    return decisionTable[key] || t("unknown_combination", { key });
  }

  if (!storytellerId) {
    paragraphText = t("think_about_association");
    isHightLight = false;
  }

  if (storytellerId) {
    paragraphText = "";
    isHightLight = false;

    if (isCurrentPlayerStoryteller) {
      if (isVoted && isGuessed) {
        paragraphText = t("wait_other_players_turn");
        isHightLight = false;
      } else {
        paragraphText = t("think_about_association");
        isHightLight = true;
      }
    }

    const isReadyToVote = !players.some(player => !player.isGuessed);
    const isReadyToCalculatePoints = players.every(player => player.isVoted);
    // console.log({ isReadyToVote, isReadyToCalculatePoints });

    if (!isCurrentPlayerStoryteller) {
      if (isShowMask) {
        paragraphText = t("player_told_first_story", { name });
        isHightLight = true;
      } else {
        paragraphText = findParagraphText();

        // Визначення, чи потрібно підсвітити текст
        isHightLight =
          (gameStatus === GUESSING && !isGuessed) ||
          (gameStatus === VOTING && !isVoted && isCarouselModeTableScreen) ||
          (gameStatus === VOTING && !isVoted && activeScreen === 2);
      }
    }

    if (isCurrentPlayerHost) {
      if (gameStatus === GUESSING && isReadyToVote) {
        paragraphText = t("push_vote_btn_for_next_stage");
        isHightLight = true;
      } else if (gameStatus === VOTING && isReadyToCalculatePoints) {
        paragraphText = t("push_finish_round_btn_for_next_stage");
        isHightLight = true;
      }
    }
  }

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
