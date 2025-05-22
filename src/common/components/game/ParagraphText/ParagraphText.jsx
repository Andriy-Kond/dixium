import clsx from "clsx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectActiveScreen,
  selectIsCarouselModeHandScreen,
  selectIsCarouselModeTableScreen,
  selectLocalGame,
  selectUserCredentials,
} from "redux/selectors.js";
import { GUESSING, VOTING } from "utils/generals/constants.js";

import css from "./ParagraphText.module.scss";

export default function ParagraphText() {
  const { gameId } = useParams();
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

  if (!currentGame) return null;

  const { players, storytellerId, gameStatus } = currentGame;
  const storyteller = players.find(p => p._id === storytellerId);
  const isCurrentPlayerStoryteller = storytellerId === playerId;

  const currentPlayer = players.find(p => p._id === playerId) || [];
  const { isGuessed, isVoted } = currentPlayer;

  // * paragraphText
  let paragraphText = "";
  if (isCarouselModeHandScreen || isCarouselModeTableScreen) {
    if (!storytellerId) {
      paragraphText =
        "Придумайте асоціацію до карти і оберіть її. Розкажіть гравцям асоціацію вголос.";
    } else if (isCurrentPlayerStoryteller) {
      paragraphText = "Очікуйте поки решта гравців походить.";
    } else {
      if (gameStatus === GUESSING && !isGuessed) {
        paragraphText =
          "Підберіть карту до асоціації [Nick 2] і зробить оберіть її.";
      }
      // else {
      //   paragraphText = "";
      // }

      if (gameStatus === VOTING && !isVoted) {
        if (activeScreen === 2) {
          // 2 - table screen
          paragraphText = `Підберіть карту до асоціації ${storyteller.name} і оберіть її.`;
        } else {
          paragraphText = "Очікуйте поки решта гравців проголосують.";
        }
      } else if (gameStatus === VOTING && isVoted) {
        paragraphText = "Очікуйте поки решта гравців проголосують.";
      }
    }
  }

  if (!isCarouselModeHandScreen && !isCarouselModeTableScreen) {
    if (!storytellerId)
      paragraphText =
        "Придумайте асоціацію до однієї зі своїх карт і зробіть нею хід. Розкажіть гравцям асоціацію вголос.";

    if (isCurrentPlayerStoryteller) {
      paragraphText = "Очікуйте поки решта гравців походить.";
    } else {
      if (gameStatus === GUESSING && !isGuessed) {
        paragraphText = `Підберіть карту до асоціації ${storyteller.name} і зробить оберіть її.`;
      }
      // else {
      //   paragraphText = "";
      // }

      if (gameStatus === VOTING && !isVoted) {
        if (activeScreen === 2) {
          // 2 - table screen
          paragraphText = `Позначте зірочками карти, що можуть належати ${storyteller.name}. Якщо впевнені - ставте одразу дві зірки.`;
        } else {
          paragraphText = "";
        }
      } else if (gameStatus === VOTING && isVoted) {
        paragraphText = "Очікуйте поки решта гравців проголосують.";
      }
    }
  }

  const isHightLight =
    !storytellerId ||
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
