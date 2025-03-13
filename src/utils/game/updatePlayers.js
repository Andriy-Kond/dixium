export const updatePlayers = ({ gamePlayers, userId, updatedHand }) => {
  return gamePlayers.map(player =>
    player._id === userId ? { ...player, hand: updatedHand } : player,
  );
};
