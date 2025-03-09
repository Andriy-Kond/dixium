import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import css from "./Modal.module.scss";

import { useSelector } from "react-redux";
import { selectGame } from "redux/selectors.js";
import socket from "servises/socket.js";

const modalPortal = document.querySelector("#root-modal");

export default function Modal({ children, currentGameId }) {
  const currentGame = useSelector(selectGame(currentGameId));
  console.log(" Modal >> currentGame:::", currentGame);

  const toggleModal = useCallback(() => {
    const updatedGame = {
      ...currentGame,
      isFirstTurn: false,
    };

    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });
  }, []);

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
