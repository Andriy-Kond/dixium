import { useCallback, useEffect } from "react";
import Mask from "../Mask/Mask.jsx";
import Button from "common/components/ui/Button/index.js";

export default function Table({
  isActive,
  setActiveScreen,
  setMiddleButton,
  activeScreen,
}) {
  const btnText = "Choose association";

  const returnToHand = useCallback(() => setActiveScreen(0), [setActiveScreen]);

  useEffect(() => {
    // console.log("Table >> isActive:::",isActive, "activeScreen:::", activeScreen);
    if (isActive && activeScreen === 2) {
      // console.log("Table >> Setting middle button");
      setMiddleButton(<Button btnText={btnText} onClick={returnToHand} />);
    }
  }, [isActive, activeScreen, returnToHand, setMiddleButton]);

  return (
    <>
      <p>Table</p>

      <Mask></Mask>
    </>
  );
}
