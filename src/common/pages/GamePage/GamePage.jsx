import GameInitial from "common/components/game/GameInitial/index.js";
import { Route, Routes } from "react-router-dom";

export default function GamePage() {
  return (
    <>
      <p>Game Page</p>
      <GameInitial />
      {/* <Routes>
        <Route path="/" element={<GameInitial />} />
        <Route path="/create" element={<CreateGame />} />
      </Routes> */}
    </>
  );
}
