import { useEffect } from "react";
import { createPortal } from "react-dom";
import css from "./Modal.module.scss";

const modalPortal = document.querySelector("#root-modal");

export default function Modal({ children, toggleModal }) {
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

  // document.querySelector("#root-modal") може повернути null, якщо елемент ще не змонтований.
  if (!modalPortal) return null; // Запобігає помилці, якщо #root-modal ще не існує

  return createPortal(
    <div className={css.backdrop} onClick={handleBackdropClick}>
      <div className={css.modalWindow}>
        {children}
        <button type="button" onClick={toggleModal}>
          Close modal
        </button>
      </div>
    </div>,
    modalPortal,
  );
}
