import { useBackButton } from "context/BackButtonContext.jsx";
import css from "./DeckCards.module.scss";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DeckCards(deck) {
  const navigate = useNavigate();
  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();

  const handleBackClick = useCallback(() => {
    console.log("handleBackClick in DeckCards");

    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    showBackButton(handleBackClick, "back", 0);

    return () => {
      hideBackButton(0);
    };
  }, [handleBackClick, hideBackButton, showBackButton]);

  return (
    <>
      <h1>Deck Cards</h1>
      {deck?.cards?.map(card => {
        return <img src="to-card" alt="card" />;
      })}
    </>
  );
}
