import { t } from "i18next";
import { gameApi } from "redux/game/gameApi.js";
import {
  setFinishPoints,
  showNotification,
} from "redux/game/localPersonalSlice.js";

export const setFinishPointsSuccess = ({
  gameId,
  finishPoints,
  currentFinishPoints,
  dispatch,
}) => {
  if (!gameId) throw new Error(`The game is ${gameId}`);

  dispatch(setFinishPoints({ gameId, finishPoints }));
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }]));

  if (currentFinishPoints !== finishPoints) {
    dispatch(
      showNotification({ message: t("points_changed"), type: "success" }),
    );
  }
};
