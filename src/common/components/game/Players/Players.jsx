import { useEffect } from "react";

export default function Players({ isActive, setMiddleButton, activeScreen }) {
  useEffect(() => {
    // console.log("Players >> isActive:::", isActive, "activeScreen:::", activeScreen, );
    if (isActive && activeScreen === 1) {
      // console.log("Players >> Clearing middle button");
      setMiddleButton(null);
    }
  }, [isActive, activeScreen, setMiddleButton]);

  return (
    <>
      <p>Players</p>
    </>
  );
}
