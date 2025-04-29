import { useParams } from "react-router-dom";

export const useGameIdParam = () => {
  const { gameId } = useParams();
  return gameId;
};
