import { MdMenu } from "react-icons/md";
import css from "./GameBottomBar.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUserCredentials } from "redux/selectors.js";
import {
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
} from "redux/game/localPersonalSlice.js";

export default function GameBottomBar({
  activeScreen,
  screensLength,
  onPrevScreen,
  onNextScreen,
  middleButton,
  isShowSidesBtns,
  // sidesButtons = isShowSidesBtns ? isShowSidesBtns : true,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const handleMenuBtn = () => {
    dispatch(
      setIsCarouselModeHandScreen({
        gameId,
        playerId,
        isCarouselModeHandScreen: false,
      }),
    );

    dispatch(
      setIsCarouselModeTableScreen({
        gameId,
        playerId,
        isCarouselModeTableScreen: false,
      }),
    );

    navigate("/game");
  };

  return (
    <div className={css.bottomBar}>
      {/* {isShowSidesBtns && (
        <Button
          btnText={"<"}
          onClick={onPrevScreen}
          btnStyle={["btnTransparentBorder"]}
          // disabled={activeScreen === 0}
        />
      )} */}

      <button className={css.btnMenu} type="button" onClick={handleMenuBtn}>
        <MdMenu />
      </button>

      {middleButton || ""}
      {/* {isShowSidesBtns && (
        <Button
          btnText={">"}
          onClick={onNextScreen}
          btnStyle={["btnTransparentBorder"]}
          // disabled={activeScreen === screensLength - 1}
        />
      )} */}
    </div>
  );
}
