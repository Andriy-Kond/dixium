import { useEffect } from "react";
import css from "./LocalModal.module.scss";

export default function LocalModal({ children, toggleModal }) {
  useEffect(() => {
    const handleKeydownEsc = e => {
      if (e.code === "Escape") {
        toggleModal();
      }
    };

    window.addEventListener("keydown", handleKeydownEsc);
    return () => {
      window.removeEventListener("keydown", handleKeydownEsc);
    };
  }, [toggleModal]);

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  return (
    <div className={css.backdrop} onClick={handleBackdropClick}>
      <div className={css.modalWindow}>{children}</div>
    </div>
  );
}
