// import { useNavigate } from "react-router-dom";
import { selectIsCreatingGame } from "app/selectors.js";
import css from "../game.module.scss";
import { setIsCreatingGame } from "features/game/gameSlice.js";
import { useDispatch, useSelector } from "react-redux";
import DecksList from "../DecksList/DecksList.jsx";
import Button from "common/components/Button";

export default function GameInitial() {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCreatingGame = useSelector(selectIsCreatingGame);

  const createGame = () => {
    dispatch(setIsCreatingGame(true));
    // navigate("/game/create");
  };

  const headerTitleText = isCreatingGame ? "Creating game" : "Available games";

  const btnText = "Create game";

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
            <div className={css.bottomBar}>
              <Button onClick={createGame} btnText={btnText} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
