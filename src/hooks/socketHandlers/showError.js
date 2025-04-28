import { Notify } from "notiflix";

export const showError = (err, t) => {
  console.log(`Socket connect_error: ${err}`);
  let errMessage = "";
  const errorMessage = err?.errorMessage || "Unknown error"; // Запасний варіант

  switch (errorMessage) {
    case "Error creating game: You already have an active game. Finish or delete it first.":
      errMessage = t("player_has_active_game");
      break;
    default:
      errMessage = errorMessage;
      break;
  }
  Notify.failure(errMessage);
};
