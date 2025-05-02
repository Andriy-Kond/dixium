import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import { showNotification } from "redux/game/localPersonalSlice.js";
import SortPlayers from "common/components/game/SortPlayers";
import SelectDecks from "common/components/game/SelectDecks";
import { useTranslation } from "react-i18next";
import css from "./CreatingGame.module.scss";
import { useNavigate } from "react-router-dom";

export default function CreatingGame() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // const [sortPlayers, setSortPlayers] = useState(false);
  // const [selectDecks, setSelectDecks] = useState(false);
  const userActiveGameId = useSelector(selectUserActiveGameId);

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId, playerGameId } = userCredentials;
  const [finishPoints, setFinishPoints] = useState("30");
  const [isSingleCardModeCheckbox, setIsSingleCardModeCheckbox] =
    useState(false);
  const currentGame = useSelector(selectLocalGame(userActiveGameId));
  const isCurrentPlayerIsHost = currentGame.hostPlayerId === userId;
  const isDisabledCheckbox =
    !isCurrentPlayerIsHost || currentGame.players.length < 7;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(playerGameId.toString()); // копіювання в буфер

      dispatch(
        showNotification({
          message: t("id_copied_to_buffer"),
          type: "success",
        }),
      );
    } catch (err) {
      console.error("Помилка копіювання:", err);
      dispatch(
        showNotification({
          message: t("cant_copy_id_to_buffer"),
          type: "error",
        }),
      );
    }
  };

  // if (sortPlayers) return <SortPlayers backButtonClick={setSortPlayers} />;
  // if (selectDecks) return <SelectDecks backButtonClick={setSelectDecks} />;

  return (
    <>
      <p>{t("req_for_start_game")}</p>
      <label>
        <input
          type="number"
          value={finishPoints}
          onChange={e => setFinishPoints(e.target.value.trim())}
        />
        {t("finish_points")}
      </label>

      <div className={css.checkboxWrapper}>
        <label
          //# для нових браузерів:
          // className={css.checkboxLabel}
          //# для старих браузерів:
          className={`${css.checkboxLabel} ${
            isSingleCardModeCheckbox ? css.checked : ""
          } ${isDisabledCheckbox ? css.disabled : ""}`}>
          <input
            disabled={isDisabledCheckbox}
            className={css.checkboxInput}
            type="checkbox"
            name="isSingleCardMode"
            onChange={() => setIsSingleCardModeCheckbox(prev => !prev)}
            checked={isSingleCardModeCheckbox}
          />
          {t("single_card_mode").toUpperCase()}
        </label>
      </div>

      <div className={css.container}>
        <p>{t("setup_players_turn")}</p>
        <button
          className={css.copyBtn}
          onClick={() => navigate("/game/sort-players")}>
          {t("players")}
        </button>

        <p>{t("select_decks")}</p>
        <button
          className={css.copyBtn}
          onClick={() => navigate("/game/select-decks")}>
          {t("game_cards")}
        </button>
      </div>

      <p>ID: {playerGameId}</p>
      <button className={css.copyBtn} onClick={copyToClipboard}>
        Копіювати в буфер
      </button>
    </>
  );
}
