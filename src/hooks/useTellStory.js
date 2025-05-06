import { useSelector } from "react-redux";
import socket from "services/socket.js";
import { GUESSING, LOBBY } from "utils/generals/constants.js";
import {
  selectCardsOnTable,
  selectGameStatus,
  selectLocalGame,
  selectPlayerHand,
  selectSelectedCardId,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import { useCallback } from "react";
import { Notify } from "notiflix";
import { discardHandToTable } from "utils/game/discardHandToTable.js";
import { useTranslation } from "react-i18next";

export const useTellStory = gameId => {
  const { t } = useTranslation();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectLocalGame(gameId));
  const { players: gamePlayers } = currentGame;

  const playerHand = useSelector(selectPlayerHand(gameId, playerId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));

  // const isFirstTurn = useSelector(selectIsFirstTurn(gameId));
  const gameStatus = useSelector(selectGameStatus(gameId));
  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));

  // Локальний стан для відстеження обробки запиту
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const tellStory = useCallback(() => {
    // console.log("tellStory");
    // console.log(" storytellerId:::", storytellerId);

    // Якщо оповідач уже є і це не я, нічого не робимо
    if (storytellerId && storytellerId !== playerId) {
      Notify.info(t("info_someone_else_is_already_the_storyteller"));
      return;
    }

    if (!selectedCardId) {
      console.log("No card selected!");
      Notify.failure(t("err_no_card_selected"));
      return;
    }

    const movedCard = playerHand.find(c => c._id === selectedCardId);

    if (!movedCard) {
      console.warn("Selected card not found in hand!");
      Notify.failure(t("err_selected_card_not_found_in_hand"));
      return;
    }

    // If storyteller not defined, the player becomes the first storyteller
    // todo: logic for storytellerId === true (maybe just add "&& !isFirstTurn"?)
    // console.log("emit to soket :>> ");
    // if (!isFirstTurn) {
    const { updatedCardsOnTable, updatedPlayers } = discardHandToTable({
      playerHand,
      movedCards: [movedCard],
      cardsOnTable,
      userId: playerId,
      gamePlayers,
      isStoryteller: true,
    });

    const updatedGame = {
      ...currentGame,
      // storytellerId: storytellerId ? storytellerId : playerId,
      storytellerId: playerId,
      gameStatus: GUESSING,
      cardsOnTable: updatedCardsOnTable,
      players: updatedPlayers,
      isFirstTurn: gameStatus === LOBBY ? true : false,
    };

    // setIsSubmitting(true); // Блокуємо повторні натискання

    const event = storytellerId ? "setNextStoryteller" : "setFirstStoryteller";

    socket.emit(event, { updatedGame }, response => {
      // setIsSubmitting(false); // Розблокуємо після відповіді
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });
    // }
  }, [
    storytellerId,
    playerId,
    selectedCardId,
    playerHand,
    cardsOnTable,
    gamePlayers,
    currentGame,
    gameStatus,
    t,
  ]);

  return tellStory;
};
