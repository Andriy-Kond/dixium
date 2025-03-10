import { useEffect } from "react";

export default function Table({ isActive, setActiveScreen, setMiddleButton }) {
  useEffect(() => {
    // console.log("Table >> isActive:::",isActive, );
    if (isActive) {
      // console.log("Table >> Setting middle button");
      setMiddleButton(null);
    }
  }, [isActive, setMiddleButton]);

  return (
    <>
      <p>Table</p>
    </>
  );
}
