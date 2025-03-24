import Button from "common/components/ui/Button/index.js";
import css from "./GameNavigationBar.module.scss";

export default function GameNavigationBar({
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
      {isShowSidesBtns && (
        <Button
          btnText={"<"}
          onClick={onPrevScreen}
          btnStyle={["btnTransparentBorder"]}
          // disabled={activeScreen === 0}
        />
      )}

      {middleButton || <span>{`${activeScreen + 1} / ${screensLength}`}</span>}

      {isShowSidesBtns && (
        <Button
          btnText={">"}
          onClick={onNextScreen}
          btnStyle={["btnTransparentBorder"]}
          // disabled={activeScreen === screensLength - 1}
        />
      )}
    </div>
  );
}
