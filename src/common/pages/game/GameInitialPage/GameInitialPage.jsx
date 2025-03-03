// import { useNavigate } from "react-router-dom";
import { selectIsCreatingGame } from "redux/selectors.js";
import css from "./GameInitialPage.module.scss";
import { setIsCreatingGame } from "redux/game/gameSlice.js";
import { useDispatch, useSelector } from "react-redux";
import DecksList from "../../../components/game/DecksList/DecksList.jsx";
import Button from "common/components/ui/Button";
import GamesList from "../../../components/game/GamesList/GamesList.jsx";

export default function GameInitialPage() {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCreatingGame = useSelector(selectIsCreatingGame);

  const createGame = () => {
    dispatch(setIsCreatingGame(true));
    // navigate("/game/create");
  };

  const headerTitleText = isCreatingGame ? "Creating game" : "Available games";

  return (
    <>
      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>
            {headerTitleText.toUpperCase()}
          </p>
        </div>
        <div className={css.pageMain}>
          {isCreatingGame && <DecksList />}

          {!isCreatingGame && (
            <>
              <GamesList />
              <div className={css.bottomBar}>
                <Button onClick={createGame} btnText={"Create new game"} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

//  If use it as individual pages (without prop "isCreatingGame")
//  <Routes>
//    <Route path="/" element={<GameInitial />} />
//    <Route path="/create" element={<CreateGame />} />
//  </Routes>
