import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectGameStatus,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";

import Lobby from "../gameStatus/Lobby/Lobby.jsx";
import {
  FINISHED,
  LOBBY,
  MAKING_TURN,
  RESULTS,
  VOTING,
} from "utils/generals/constants.js";

export default function Game() {
  const { currentGameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(currentGameId));
  console.log(" Game >> gameStatus:::", gameStatus);

  const storytellerId = useSelector(selectStorytellerId(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);

  //% mapping method:
  const statusComponents = {
    // [LOBBY]: <Lobby />,
    // [MAKING_TURN]: <MakingTurn />,
    // [VOTING]: <Voting />,
    // [RESULTS]: <Results />,
    // [FINISHED]: <Finished />,
  };

  const isShowLobby =
    gameStatus === LOBBY ||
    (gameStatus === MAKING_TURN && storytellerId !== userCredentials._id);

  return (
    <>
      <p>Game</p>
      {/* {statusComponents[gameStatus] || <p>Unknown status</p>} */}
      {isShowLobby && <Lobby />}
    </>
  );
}

//% switch method:
// const renderContent = () => {
//     switch (gameStatus) {
//       case "lobby":
//         return <Lobby />;
//       case "makingMove":
//         return <MakingMove />;
//       case "voting":
//         return <Voiting />;
//       case "results":
//         return <Results />;
//       case "finished":
//         return <Finished />;
//       default:
//         return null; // або можна додати дефолтний компонент, наприклад, <p>Unknown status</p>
//     }
//   };

//   return (
//     <>
//       <p>Game</p>
//       {renderContent()}
//     </>
//   );
// }

//% fn method:
// const getContent = () => {
//     if (gameStatus === "lobby") return <Lobby />;
//     if (gameStatus === "makingMove") return <MakingMove />;
//     if (gameStatus === "voting") return <Voiting />;
//     if (gameStatus === "results") return <Results />;
//     if (gameStatus === "finished") return <Finished />;
//     return null;
//   };

//   return (
//     <>
//       <p>Game</p>
//       {getContent()}
//     </>
//   );
// }
