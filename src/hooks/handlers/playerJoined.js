import { Notify } from "notiflix";

export const playerJoined = (
  game,
  player,
  message,
  userCredentials,
  currentGameId,
  navigate,
) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  message && Notify.success(message); // Notify about new player

  if (player._id === userCredentials._id && currentGameId !== game._id)
    navigate(`/game/${game._id}`);
};
