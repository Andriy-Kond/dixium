import Button from "common/components/ui/Button/index.js";
import css from "./GameNavigationBar.module.scss";

export default function GameNavigationBar({
  activeScreen,
  screensLength,
  onPrevScreen,
  onNextScreen,
  middleButton,
  sidesButtons = true,
}) {
  // console.log("GameNavigationBar >> activeScreen:::", activeScreen);
  // console.log("GameNavigationBar >> middleButton:::", middleButton);

  return (
    <div className={css.bottomBar}>
      {sidesButtons && (
        <Button
          btnText={"<"}
          onClick={onPrevScreen}
          btnStyle={["btnTransparentBorder"]}
          // disabled={activeScreen === 0}
        />
      )}

      {middleButton || <span>{`${activeScreen + 1} / ${screensLength}`}</span>}

      {sidesButtons && (
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
