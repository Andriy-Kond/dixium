import { useEffect } from "react";

export default function Players({ isActiveScreen, setMiddleButton }) {
  useEffect(() => {
    // console.log("Players >> isActiveScreen:::", isActiveScreen );
    if (isActiveScreen) {
      // console.log("Players >> Clearing middle button");
      setMiddleButton(null);
    }
  }, [isActiveScreen, setMiddleButton]);

  return (
    <>
      <p>Players</p>
    </>
  );
}
