import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import socket from "services/socket.js";
import {
  setLocalGame,
  setPageHeaderBgColor,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import Button from "common/components/ui/Button";
import css from "./GamesListPage.module.scss";
import { LOBBY } from "utils/generals/constants.js";
import { useNavigate } from "react-router-dom";
import UserMenu from "common/components/navComponents/UserMenu/index.js";
import InformMessage from "common/components/ui/InformMessage/InformMessage.jsx";
import { useGetCurrentGameQuery } from "redux/game/gameApi.js";

export default function GamesListPage() {
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
  const headerTitleText = t("tixid");

  const [searchGameNumber, setSearchGameNumber] = useState(null); // для пошуку (type: Number)
  const inputRef = useRef(null);

  // set active game if it is to redux cash and local storage:
  const userActiveGameId = useSelector(selectUserActiveGameId);
  const { data: activeGame, isFetching: isFetchingCurrentGame } =
    useGetCurrentGameQuery(userActiveGameId, {
      skip: !userActiveGameId || userActiveGameId === "",
    });
  useEffect(() => {
    if (userActiveGameId) dispatch(setLocalGame(activeGame));
  }, [activeGame, dispatch, userActiveGameId]);

  // const isRedirecting = useSelector(selectIsRedirecting);
  const currentGame = useSelector(selectLocalGame(userActiveGameId));
  // const [searchingGame, setSearchingGame] = useState(null);
  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderBgColor("#5D7E9E"));
  }, [dispatch, headerTitleText]);

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

  const resetSearchGame = () => {
    setSearchGameNumber(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeCurrentGame = async gameId => {
    socket.emit("Game_Delete", { gameId, userId: playerId });
  };

  const returnToGame = () => {
    if (isCurrentPlayerIsHost)
      navigate(`${userActiveGameId}/setup/prepare-game`);
    else navigate(`${userActiveGameId}/current-game`);
    // navigate(-1);
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

  // useEffect(() => {
  //   if (isRedirecting) {
  //     dispatch(updateIsRedirecting(false));
  //     return null; // Або повертайте лоадер, якщо потрібно
  //   }
  // }, [dispatch, isRedirecting]);

  // if (isRedirecting) {
  //   return null; // Або повертайте лоадер, якщо потрібно
  // }

  return (
    <>
      <p>GameListPage</p>
      <InformMessage />
      <div className={css.container}>
        <div className={css.pageMain}>
          {/* {isCreatingGame && <CreatingGame />} */}
          {/* {isCreatingGame && <PrepareGame />} */}

          {/* {!isCreatingGame && ( */}
          <>
            <p>{t("req_for_join_game")}</p>
            <div className={css.searchGameWrapper}>
              {isPlayerInGame ? (
                <>
                  <p>my game</p>
                  <Button onClick={returnToGame}>{`${t("waiting")} >`}</Button>
                  <Button btnText={t("finish_game")} onClick={finishGame} />
                </>
              ) : (
                <form onSubmit={handleJoinSubmit}>
                  <label className={css.searchGameLabel}>
                    <input
                      autoFocus
                      ref={inputRef}
                      className={css.searchGameInput}
                      type="text"
                      onChange={handleChange}
                      placeholder={t("enter_id_here")}
                      inputMode="numeric"
                      maxLength={5} // 4 цифри + дефіс
                      aria-label={t("search_game_by_number")}
                    />

                    <p className={css.hint}>{t("enter_4_digits")}</p>
                  </label>

                  {searchGameNumber && (
                    <button
                      type="button"
                      onClick={resetSearchGame}
                      className={css.clearButton}>
                      {t("clear")}
                    </button>
                  )}

                  <button
                    className={css.searchButton}
                    type="submit"
                    disabled={getDigitCount() !== 4 || searchGameNumber > 9999}>
                    {t("join")}
                  </button>
                </form>
              )}
            </div>

            {/* todo переробити умову для хоста і не хоста */}
            {!userActiveGameId && (
              <>
                <p>{t("create_own_game")}</p>
                <Button
                  onClick={handleCreateGame}
                  btnText={`${t("create_new_game")} ID:${playerGameId}`}
                />
              </>
            )}

            {/* <p>{t("select_decks")}</p>
            <button
              className={css.copyBtn}
              onClick={() => navigate("/game/select-decks")}>
              {t("game_cards")}
            </button> */}

            <UserMenu />

            {/* <GamesList /> */}
          </>
          {/* )} */}
        </div>
      </div>
    </>
  );
}
