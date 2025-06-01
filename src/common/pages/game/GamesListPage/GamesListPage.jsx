import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTranslation } from "react-i18next";

import socket from "services/socket.js";
import { useGetCurrentGameQuery } from "redux/game/gameApi.js";
import {
  setLocalGame,
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";
import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import UserMenu from "common/components/navComponents/UserMenu";
import FormInput from "common/components/game/FormInput";
import { LOBBY } from "utils/generals/constants.js";
import { MdArrowForwardIos } from "react-icons/md";
import css from "./GamesListPage.module.scss";

export default function GamesListPage() {
  useEffect(() => {
    console.log("render GamesListPage");
  }, []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const userCredentials = useSelector(selectUserCredentials);

  const {
    name,
    avatarURL,
    isGuessed,
    isVoted,
    playerGameId,
    _id: playerId,
  } = userCredentials;

  const [searchGameNumber, setSearchGameNumber] = useState(null); // для пошуку (type: text)

  // set active game if it is to redux cash and local storage:
  const userActiveGameId = useSelector(selectUserActiveGameId);

  const { data: activeGame, isFetching: isFetchingCurrentGame } =
    useGetCurrentGameQuery(userActiveGameId, {
      skip: !userActiveGameId || userActiveGameId.trim() === "",
    });

  // set active game
  useEffect(() => {
    if (!userActiveGameId || isFetchingCurrentGame) return;

    const isUserInGame = activeGame?.players.find(
      player => player?._id === userCredentials._id,
    );
    if (!activeGame || !isUserInGame) {
      dispatch(setLocalGame(null));
      socket.emit("UserActiveGameId_Clear", { userId: userCredentials._id }); // очищення поля на сервері
      return;
    }

    // console.log("встановлюю активну гру ", activeGame?.gameName);
    if (userActiveGameId === activeGame._id) {
      dispatch(setLocalGame(activeGame));
    }
  }, [
    activeGame,
    isFetchingCurrentGame,
    userActiveGameId,
    userCredentials._id,
    dispatch,
  ]);

  const currentGame = useSelector(selectLocalGame(userActiveGameId));

  //# Page header color and text
  useEffect(() => {
    // console.log("currentGame", currentGame);
    dispatch(setPageHeaderText(t("tixid")));
    dispatch(setPageHeaderTextSecond(""));
  }, [currentGame, dispatch, t]);

  const handleCreateGame = () => {
    const gameData = {
      gameStatus: LOBBY,
      isGameRunning: false,
      isGameStarted: false,
      isFirstTurn: false,
      isSingleCardMode: false,
      hostPlayerId: playerId,
      hostPlayerName: name,
      storytellerId: null,
      currentRoundNumber: 0,
      cardsOnTable: [],
      votes: {},
      scores: {},
      players: [],
      deck: [],
      discardPile: [],
      roundResults: [],
      playerGameId: null,
    };

    socket.emit("Game_Create", { gameData });
  };

  const [formattedValue, setFormattedValue] = useState(""); // для відображення (type: text)

  const handleChange = e => {
    // const input = e.target;
    const inputRawValue = e.target.value.replace(/[^0-9]/g, ""); // Фільтрує лише цифри
    const inputValue = inputRawValue.slice(0, 4); // Обмеження до 4 цифр

    // const numericValue = inputValue ? parseInt(inputValue, 10) : null; // Якщо inputValue порожній, numericValue буде null, що унеможливлює NaN при відправленні на сервер у emitSearch
    setSearchGameNumber(inputValue); // type: text

    // Форматування для відображення
    let formattedValue = inputRawValue;
    if (inputRawValue.length > 2) {
      formattedValue = `${inputRawValue.slice(0, 2)}-${inputRawValue.slice(2)}`; // Значення для відображення з дефісом
    } else {
      formattedValue = inputRawValue;
    }

    setFormattedValue(formattedValue); // type: text
    // input.value = formattedValue; // Оновити значення інпута
  };

  // Пошук гри і приєднання до неї, якщо знайдена
  const handleJoinSubmit = e => {
    e.preventDefault();

    const isPlayerInGame = currentGame?.players.some(
      player => player._id === playerId,
    );

    // Відправлення запиту, якщо є всі 4 цифри
    if (searchGameNumber?.length === 4 && Number(searchGameNumber) <= 9999) {
      // console.log("send findAndJoinToGame");
      socket.emit("findAndJoinToGame_req", {
        searchGameNumber: Number(searchGameNumber),
        player: {
          _id: playerId,
          name,
          avatarURL,
          hand: [],
          isGuessed: isPlayerInGame ? isGuessed : false,
          isVoted: isPlayerInGame ? isVoted : false,
        },
      });
    }
  };

  const returnToGame = () => {
    // console.log("return to game");
    const targetPath = !currentGame.isGameRunning
      ? isCurrentPlayerIsHost
        ? `${userActiveGameId}/setup/prepare-game`
        : `${userActiveGameId}/setup/sort-players`
      : `${userActiveGameId}/current-game`;

    navigate(targetPath, { state: { from: location } });
  };

  const removeCurrentGame = async gameId => {
    socket.emit("Game_Delete", { gameId, userId: playerId });
  };

  const removePlayer = userId => {
    if (!currentGame || !currentGame.players) return;

    const { players, deck, discardPile } = currentGame;

    const { included, excluded } = players.reduce(
      (acc, player) => {
        if (player._id !== userId) {
          acc.included.push(player);
        } else {
          acc.excluded.push(player);
        }

        return acc;
      },
      {
        included: [],
        excluded: [],
      },
    );

    // Перевірка, чи є видалений гравець
    const deletedPlayer = excluded.find(player => player._id === userId);

    // скидаю його карти у відбій
    const newDiscardPile = deletedPlayer
      ? [...discardPile, ...deletedPlayer.hand]
      : [...discardPile];

    const updatedGame = {
      ...currentGame,
      players: included,
      discardPile: newDiscardPile,
    };

    socket.emit("deleteUserFromGame", { updatedGame, deletedUserId: userId });
  };

  const finishGame = () => {
    if (isCurrentPlayerIsHost) {
      removeCurrentGame(userActiveGameId);
    } else {
      removePlayer(playerId);
    }
  };

  const isCanFind =
    searchGameNumber?.length === 4 && Number(searchGameNumber) <= 9999;
  const isPlayerInGame = currentGame?.players.some(
    player => player._id === playerId,
  );
  const isCurrentPlayerIsHost = currentGame?.hostPlayerId === playerId;

  return (
    <>
      <div className={css.pageOuterContainer}>
        <div className={css.pageInnerContainer}>
          <p className={css.infoText}>
            {isPlayerInGame
              ? t("req_for_join_to_other_game")
              : t("req_for_join_game")}
          </p>

          {isPlayerInGame && (
            <div className={`${css.waitingList} ${css.mgnTop}`}>
              <p className={css.infoText}>
                {`${t("active_game")} ID: ${currentGame.playerGameId}`}
              </p>
              <div className={`${css.listItem} ${css.mgnBtm}`}>
                <p className={css.activeText}>
                  {isCurrentPlayerIsHost ? t("my_game") : userCredentials.name}
                </p>
                <button className={css.activeBtnLink} onClick={returnToGame}>
                  <span>{t("waiting")}</span>
                  <MdArrowForwardIos className={css.btnLinkIcon} />
                </button>
              </div>
              <button className={css.btn} onClick={finishGame}>
                {t("finish_game")}
              </button>
            </div>
          )}

          {!isPlayerInGame && (
            <FormInput
              handleSubmit={handleJoinSubmit}
              onChange={handleChange}
              value={formattedValue}
              inputMode={"numeric"}
              placeholder={t("enter_id")}
              maxLength={5} // 4 цифри + дефіс
              ariaLabel={t("search_game_by_number")}
              btnText={t("join")}
              isDisableSubmitBtn={!isCanFind}
            />
          )}

          {/* todo переробити умову для хоста і не хоста */}
          {!userActiveGameId && (
            <>
              <p className={css.infoText}>{t("create_own_game")}</p>

              <button className={css.btn} onClick={handleCreateGame}>
                {`${t("create_new_game")} ID:${playerGameId}`}
              </button>
            </>
          )}

          <UserMenu />
        </div>
      </div>
    </>
  );
}
