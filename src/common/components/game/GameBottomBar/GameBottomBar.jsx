import Button from "common/components/ui/Button/index.js";
import Menu from "common/components/navComponents/Menu/Menu.jsx";
import CurrentGameMenu from "../CurrentGameMenu/CurrentGameMenu.jsx";
import css from "./GameBottomBar.module.scss";

export default function GameBottomBar({
  activeScreen,
  screensLength,
  onPrevScreen,
  onNextScreen,
  middleButton,
  isShowSidesBtns,
  // sidesButtons = isShowSidesBtns ? isShowSidesBtns : true,
}) {
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
      <CurrentGameMenu />
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
