import { useEffect } from "react";

export default function Players({ isActive, setMiddleButton }) {
  useEffect(() => {
    // console.log("Players >> isActive:::", isActive );
    if (isActive) {
      // console.log("Players >> Clearing middle button");
      setMiddleButton(null);
    }
  }, [isActive, setMiddleButton]);

  return (
    <>
      <p>Players</p>
    </>
  );
}
