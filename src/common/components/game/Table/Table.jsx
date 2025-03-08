import { useEffect } from "react";

export default function Table({ setMiddleButton, isActive }) {
  useEffect(() => {
    if (isActive) {
      setMiddleButton(null); // За замовчуванням — без кнопки
    }
  }, [isActive, setMiddleButton]);

  return (
    <>
      <p>Table</p>
    </>
  );
}
