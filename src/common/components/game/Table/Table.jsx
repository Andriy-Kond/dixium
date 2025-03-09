import { useCallback, useEffect } from "react";

import Button from "common/components/ui/Button/index.js";

export default function Table({ isActive, setActiveScreen, setMiddleButton }) {
  const btnText = "Choose association";

  const returnToHand = useCallback(() => setActiveScreen(0), [setActiveScreen]);

  useEffect(() => {
    // console.log("Table >> isActive:::",isActive, );
    if (isActive) {
      // console.log("Table >> Setting middle button");
      setMiddleButton(<Button btnText={btnText} onClick={returnToHand} />);
    }
  }, [isActive, returnToHand, setMiddleButton]);

  return (
    <>
      <p>Table</p>

      {/* <Mask></Mask> */}
    </>
  );
}
