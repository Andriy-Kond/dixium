import { useNavigate, useParams } from "react-router-dom";

import { MdMenu } from "react-icons/md";
import css from "./CurrentGameMenu.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
} from "redux/game/localPersonalSlice.js";
import { selectUserCredentials } from "redux/selectors.js";

export default function CurrentGameMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const handleMenuBtn = () => {
    // dispatch(
    //   setIsCarouselModeHandScreen({
    //     gameId,
    //     playerId,
    //     isCarouselModeHandScreen: false,
    //   }),
    // );

    // dispatch(
    //   setIsCarouselModeTableScreen({
    //     gameId,
    //     playerId,
    //     isCarouselModeTableScreen: false,
    //   }),
    // );

    navigate("/game");
  };

  return (
    <>
      <button className={css.btnMenu} type="button" onClick={handleMenuBtn}>
        <MdMenu />
      </button>
    </>
  );
}
