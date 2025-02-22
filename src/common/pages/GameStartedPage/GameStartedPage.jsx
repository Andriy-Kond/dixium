import socket from "socket.js";
import { Notify } from "notiflix";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectGames } from "app/selectors.js";
import { updateGame } from "features/game/gameSlice.js";

export default function GameStartedPage() {
  const { currentGameId } = useParams();

  const navigate = useNavigate();
  const games = useSelector(selectGames);
  const dispatch = useDispatch();

  const currentGame = games.find(game => game._id === currentGameId);

  useEffect(() => {
    const handleNewPlayerJoined = ({ game, message }) => {
      dispatch(updateGame(game));
      Notify.success(message);
    };

    const handleGameDeleted = () => {
      navigate(`/game`, { replace: true });
    };

    socket.on("currentGameWasDeleted", handleGameDeleted); // return to gamesList
    socket.on("playerJoined", handleNewPlayerJoined); // Notify about new player

    return () => {
      socket.off("playerJoined", handleNewPlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted);
    };
  }, [dispatch, navigate]);

  return (
    <>
      <p>Game Started Page</p>
      <p>{currentGame?.gameName}</p>
      <ul>
        {currentGame?.players.map(player => (
          <li key={player._id}>{player.name}</li>
        ))}
      </ul>
    </>
  );
}
