import { useEffect } from "react";

export default function Players({ setMiddleButton, isActive }) {
  useEffect(() => {
    if (isActive) {
      setMiddleButton(null); // За замовчуванням — без кнопки
    }
  }, [isActive, setMiddleButton]);

  return (
    <>
      <p>Players</p>
    </>
  );
}
