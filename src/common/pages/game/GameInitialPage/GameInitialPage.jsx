// import { useNavigate } from "react-router-dom";
import { selectIsCreatingGame } from "redux/selectors.js";
import css from "./GameInitialPage.module.scss";
import { setIsCreatingGame } from "redux/game/gameSlice.js";
import { useDispatch, useSelector } from "react-redux";
import DecksList from "../../../components/game/DecksList/DecksList.jsx";
import Button from "common/components/ui/Button";
import GamesList from "../../../components/game/GamesList/GamesList.jsx";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { setPageHeaderText } from "redux/game/localPersonalSlice.js";

export default function GameInitialPage() {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isCreatingGame = useSelector(selectIsCreatingGame);
  const headerTitleText = isCreatingGame
    ? t("creating_game")
    : t("available_games");

  useEffect(() => {
    dispatch(setPageHeaderText(headerTitleText));
  }, [dispatch, headerTitleText]);

  const createGame = () => {
    dispatch(setIsCreatingGame(true));
    // navigate("/game/create");
  };

  return (
    <>
      <div className={css.container}>
        {/* <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>
            {headerTitleText.toUpperCase()}
          </p>
        </div> */}
        <div className={css.pageMain}>
          {isCreatingGame && <DecksList />}

          {!isCreatingGame && (
            <>
              <GamesList />
              <div className={css.bottomBar}>
                <Button
                  onClick={createGame}
                  btnText={t("create_new_game")}
                  btnStyle={["btnFlexGrow"]}
                />
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
