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

  const { players, storytellerId, gameStatus } = currentGame;
  const storyteller = players.find(p => p._id === storytellerId);
  const name = storyteller?.name;

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  const currentPlayer = players.find(p => p._id === playerId) || [];
  const { isGuessed, isVoted } = currentPlayer;

  const OPEN_HAND = "openHand";
  const OPEN_TABLE = "openTable";
  const CLOSE = "close";
  const WAITING = "waiting";
  const NOT_GUESSING = "notGuessing";
  const NOT_VOTING = "notVoting";

  let paragraphText = "";

  const decisionTable = {
    lobby_hand_openHand: t("waiting_tellers_story", { name }),
    lobby_players: "lobby_players",
    lobby_table_openTable: "lobby_table_openTable",
    lobby_close: t("waiting_tellers_story", { name }),

    notGuessing_hand_openHand: t("select_card_make_turn", { name }),
    notGuessing_players: "notGuessing_players",
    notGuessing_table_openTable: "notGuessing_table_openTable",
    notGuessing_close: t("select_card_make_turn", { name }),

    notVoting_hand_openHand: "notVoting_hand_openHand",
    notVoting_players: "notVoting_players",
    notVoting_table_openTable: t("select_card_make_turn", { name }),
    notVoting_close: t("check_cards_one_two_stars", { name }),

    round_results_hand_openHand: "round_results_hand_openHand",
    round_results_players: "round_results_players",
    round_results_table_openTable: "round_results_table_openTable",
    round_results_close: "round_results_close",

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
    if (gameState === WAITING) key = WAITING;

    if (gameState !== WAITING) {
      if (!isCarouselModeHandScreen && !isCarouselModeTableScreen) {
        key = `${gameState}_${carouselState}`;
      } else if (screenState === PLAYERS) {
        key = `${gameState}_${screenState}`;
      } else {
        key = `${gameState}_${screenState}_${carouselState}`;
      }
    }

    // console.log("ParagraphText >> key:::", key);
    return (
      decisionTable[key] ||
      t("unknown_combination", { key, gameState, screenState, carouselState })
    );
  }

  if (!storytellerId) paragraphText = t("think_about_association");

  if (storytellerId) {
    if (isShowMask && !isCurrentPlayerStoryteller) {
      paragraphText = t("player_told_first_story", { name });
    } else if (isCurrentPlayerStoryteller) {
      paragraphText =
        isVoted && isGuessed
          ? t("wait_other_players_turn")
          : t("think_about_association");
    } else {
      paragraphText = findParagraphText();
    }
  }

  // Визначення, чи потрібно підсвітити текст
  const isHightLight =
    !storytellerId ||
    isShowMask ||
    (isCurrentPlayerStoryteller && !isGuessed && !isVoted) ||
    (gameStatus === GUESSING && !isGuessed) ||
    (gameStatus === VOTING && !isVoted && isCarouselModeTableScreen) ||
    (gameStatus === VOTING && !isVoted && activeScreen === 2);

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
