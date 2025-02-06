import AvailableGames from "common/components/game/AvailableGames";
import CreateGame from "common/components/game/CreateGame";
import ChatPage from "../ChatPage";

export default function GamePage() {
  return (
    <>
      <p>Game Page</p>
      <CreateGame></CreateGame>
      <ChatPage></ChatPage>

      {/* <AvailableGames></AvailableGames> */}
    </>
  );
}
