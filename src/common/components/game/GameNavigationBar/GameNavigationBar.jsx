import Button from "common/components/ui/Button/index.js";
import css from "./GameNavigationBar.module.scss";

export default function GameNavigationBar({
  activeScreen,
  screensLength,
  onPrevScreen,
  onNextScreen,
  middleButton, // Пропс для специфічної кнопки по середині між вліво-вправо
}) {
  console.log(" activeScreen:::", activeScreen);
  return (
    <div className={css.bottomBar}>
      <Button
        btnText={"<"}
        onClick={onPrevScreen}
        // disabled={activeScreen === 0}
      />

      {middleButton || <span>{`${activeScreen + 1} / ${screensLength}`}</span>}

      <Button
        btnText={">"}
        onClick={onNextScreen}
        // disabled={activeScreen === screensLength - 1}
      />
    </div>
  );
}
