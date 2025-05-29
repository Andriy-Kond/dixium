import { t } from "i18next";
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

  if (currentFinishPoints === finishPoints) return;

  dispatch(setFinishPoints({ gameId, finishPoints }));
  dispatch(showNotification({ message: t("points_changed"), type: "success" }));
};
