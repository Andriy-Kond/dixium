import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import socket from "services/socket.js";

import { useTranslation } from "react-i18next";
import {
  setLocalGame,
  setPageHeaderBgColor,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import { useGetCurrentGameQuery } from "redux/game/gameApi.js";

import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import UserMenu from "common/components/navComponents/UserMenu";
import InfoMessage from "common/components/ui/InfoMessage";

import { LOBBY } from "utils/generals/constants.js";

import { MdArrowForwardIos } from "react-icons/md";
import css from "./GamesListPage.module.scss";

export default function GamesListPage() {
  // console.log("GamesListPage");
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const [searchGameNumber, setSearchGameNumber] = useState(null); // для пошуку (type: Number)
  const inputRef = useRef(null);

  // set active game if it is to redux cash and local storage:
  const userActiveGameId = useSelector(selectUserActiveGameId);

  const { data: activeGame, isFetching: isFetchingCurrentGame } =
    useGetCurrentGameQuery(userActiveGameId, {
      skip: !userActiveGameId || userActiveGameId === "",
    });

  // set active game
  useEffect(() => {
    if (!userActiveGameId || !activeGame || isFetchingCurrentGame) return;
    // console.log("GamesListPage set activeGame:::", activeGame.gameName);

    // console.log(
    //   " useEffect >> userActiveGameId !== activeGame?._id:::",
    //   userActiveGameId !== activeGame?._id,
    // );
    // console.log("встановлюю активну гру ", activeGame?.gameName);
    if (userActiveGameId === activeGame._id) {
      dispatch(setLocalGame(activeGame));
    }
  }, [activeGame, dispatch, isFetchingCurrentGame, userActiveGameId]);

  // const isRedirecting = useSelector(selectIsRedirecting);
  const currentGame = useSelector(selectLocalGame(userActiveGameId));
  // const [searchingGame, setSearchingGame] = useState(null);

  //# Page header color and text
  useEffect(() => {
    const headerTitleText = t("tixid");
    console.log(" useEffect >> headerTitleText:::", headerTitleText);
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderBgColor("#5D7E9E"));
  }, [dispatch, t]);

  const isPlayerInGame = currentGame?.players.some(
    player => player._id === playerId,
  );
  const isCurrentPlayerIsHost = currentGame?.hostPlayerId === playerId;

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
      currentRound: 0,
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

  // useEffect(() => {
  //   // Скидати поле пошуку лише коли така гра знайдена
  //   const searchingGame = Object.values(games).find(
  //     game => game.playerGameId === searchGameNumber,
  //   );

  //   if (searchingGame) {
  //     inputRef.current.value = "";
  //     setSearchGameNumber(null);
  //   }
  // }, [games, searchGameNumber]);

  const handleChange = e => {
    const input = e.target;
    const inputRawValue = input.value.replace(/[^0-9]/g, ""); // Фільтрує лише цифри
    const inputValue = inputRawValue.slice(0, 4); // Обмеження до 4 цифр

    const numericValue = inputValue ? parseInt(inputValue, 10) : null; // Якщо inputValue порожній, numericValue буде null, що унеможливлює NaN при відправленні на сервер у emitSearch
    setSearchGameNumber(numericValue); // type: Number

    // Форматування для відображення
    let formattedValue = inputRawValue;
    if (inputRawValue.length > 2) {
      formattedValue = `${inputRawValue.slice(0, 2)}-${inputRawValue.slice(2)}`; // Значення для відображення з дефісом
    }

    input.value = formattedValue; // Оновити значення інпута
  };

  // Допоміжна функція для підрахунку кількості цифр
  const getDigitCount = () =>
    searchGameNumber ? String(searchGameNumber).length : 0;

  // Пошук гри і приєднання до неї, якщо знайдена
  const handleJoinSubmit = e => {
    e.preventDefault();
    const digitCount = getDigitCount();

    // Відправлення запиту, якщо є всі 4 цифри
    if (searchGameNumber && digitCount === 4 && searchGameNumber <= 9999) {
      console.log("send findAndJoinToGame");
      socket.emit("findAndJoinToGame_req", {
        searchGameNumber,
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

  const removeCurrentGame = async gameId => {
    socket.emit("Game_Delete", { gameId, userId: playerId });
  };

  const returnToGame = () => {
    if (isCurrentPlayerIsHost && !currentGame.isGameRunning) {
      navigate(`${userActiveGameId}/setup/prepare-game`);
    } else {
      navigate(`${userActiveGameId}/current-game`);
      // navigate(-1);
    }
  };

  const removePlayer = userId => {
    if (!currentGame || !currentGame.players) return;

    const players = [...currentGame.players];
    const newPlayers = players.filter(p => p._id !== userId);
    const updatedGame = { ...currentGame, players: newPlayers };

    socket.emit("deleteUserFromGame", { updatedGame, deletedUserId: userId });
  };

  const finishGame = () => {
    if (isCurrentPlayerIsHost) {
      removeCurrentGame(userActiveGameId);
    } else {
      removePlayer(playerId);
    }
  };

  const isCanFind = getDigitCount() === 4 && searchGameNumber < 9999;

  const handleFocus = () => {
    console.log("on Focus");
    inputRef.current.classList.add(css["input-focused"]);
  };
  const handleBlur = () => {
    console.log("on Blur");

    inputRef.current.classList.remove(css["input-focused"]);
  };

  return (
    <>
      {/* <p>GameListPage</p> */}
      <div className={css.container}>
        <div className={css.infoMessageContainer}>
          <InfoMessage />
        </div>
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
          <form className={css.searchForm} onSubmit={handleJoinSubmit}>
            <input
              className={`${css.searchInput} ${
                isCanFind && css.searchInputReady
              }`}
              // className={css.searchInput}
              ref={inputRef}
              // autoFocus // виникає проблема при видаленні гри - ref не встигає сформуватись (треба додавати useEffect чи setTimeout для встановлення класу input-focused)
              type="text"
              onChange={handleChange}
              placeholder={t("enter_id")}
              inputMode="numeric"
              maxLength={5} // 4 цифри + дефіс
              aria-label={t("search_game_by_number")}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            {/* {searchGameNumber && (
              <button
                className={css.clearButton}
                type="button"
                onClick={resetSearchGame}>
                {t("clear")}
              </button>
            )} */}

            <button className={css.btn} type="submit" disabled={!isCanFind}>
              {t("join")}
            </button>
          </form>
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
    </>
  );
}
