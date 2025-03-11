import { useEffect } from "react";

export default function Table({
  isActiveScreen,
  setActiveScreen,
  setMiddleButton,
}) {
  useEffect(() => {
    // console.log("Table >> isActiveScreen:::",isActiveScreen, );
    if (isActiveScreen) {
      // console.log("Table >> Setting middle button");
      setMiddleButton(null);
    }
  }, [isActiveScreen, setMiddleButton]);

  return (
    <>
      <p>Table</p>
    </>
  );
}
