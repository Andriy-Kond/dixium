import { useTranslation } from "react-i18next";
import { useGetAllDecksQuery } from "redux/game/gameApi.js";
import { useNavigate } from "react-router-dom";
import css from "./SelectDecks.module.scss";

export default function SelectDecks() {
  const { data: allDecks } = useGetAllDecksQuery();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <p>{t("select_decks")}</p>
      {allDecks.map(deck => {
        return (
          <>
            <button
              className={css.copyBtn}
              onClick={() => navigate("/game/desk-cards")}>
              {`${t("view_deck_cards")} ${deck.name}`}
            </button>
          </>
        );
      })}
    </>
  );
}
