import { MdCheck } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import socket from "services/socket.js";
import {
  selectCardsSet,
  selectIsCarouselModeHandScreen,
  selectIsShowMask,
  selectLocalGame,
  selectSelectedCardId,
  selectUserCredentials,
} from "redux/selectors.js";
import {
  LOBBY,
  GUESSING,
  VOTING,
  ROUND_RESULTS,
  FINISH,
} from "utils/generals/constants.js";

import css from "./Hand.module.scss";
import Button from "common/components/ui/Button";
import Mask from "../Mask/Mask.jsx";
import { useTellStory } from "hooks/useTellStory.js";
import { useGuess } from "hooks/useGuess.js";
import { Notify } from "notiflix";
import {
  setSelectedCardId,
  removeSelectedCardId,
  setIsShowMask,
  setIsCarouselModeHandScreen,
  setCardsSet,
} from "redux/game/localPersonalSlice.js";
import { useStartNewRound } from "hooks/useStartNewRound.js";
import { useTranslation } from "react-i18next";
import ImgGen from "common/components/ui/ImgGen";
import { useBackButton } from "context/BackButtonContext.jsx";
import clsx from "clsx";

export default function Hand({ isActiveScreen, setMiddleButton }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showBackButton, hideBackButton } = useBackButton();
  const { gameId } = useParams();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectLocalGame(gameId));
  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

  const isCarouselModeHandScreen = useSelector(
    selectIsCarouselModeHandScreen(gameId, playerId),
  );

  const cardsSet = useSelector(selectCardsSet(gameId, playerId));
  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));
  const { firstGuessCardSet, secondGuessCardSet } = cardsSet;

  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

  const tellStory = useTellStory(gameId);
  const guessStory = useGuess(gameId, cardsSet);
  const startNewRound = useStartNewRound(gameId);

  const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeHandScreen,
  });

  const handleStory = useCallback(() => {
    // console.log("handleStory");
    if (!currentGame) return;
    currentGame.gameStatus === GUESSING ? guessStory() : tellStory();

    const emptyCardsSet = { firstGuessCardSet: null, secondGuessCardSet: null };
    dispatch(setCardsSet({ gameId, playerId, cardsSet: emptyCardsSet })); // не обов'язково

    dispatch(removeSelectedCardId({ gameId, playerId })); // clear

    // закриваю карусель
    dispatch(
      setIsCarouselModeHandScreen({
        gameId,
        playerId,
        isCarouselModeHandScreen: false,
      }),
    );
  }, [currentGame, dispatch, gameId, guessStory, playerId, tellStory]);

  const returnToHand = useCallback(() => {
    // console.log("returnToHand");
    const updatedGame = { ...currentGame, isFirstTurn: false };
    dispatch(setIsShowMask({ gameId, playerId, isShow: false }));

    socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    dispatch(removeSelectedCardId({ gameId, playerId })); // clear
  }, [currentGame, dispatch, gameId, playerId]);

  const carouselModeOn = idx => {
    // console.log("carouselModeOn");
    setSelectedCardIdx(idx);

    dispatch(
      setIsCarouselModeHandScreen({
        gameId,
        playerId,
        isCarouselModeHandScreen: true,
      }),
    );

    setActiveCardIdx(idx);
  };

  const carouselModeOff = useCallback(() => {
    // console.log("carouselModeOff");
    dispatch(
      setIsCarouselModeHandScreen({
        gameId,
        playerId,
        isCarouselModeHandScreen: false,
      }),
    );
  }, [dispatch, gameId, playerId]);

  const toggleCardSelection = useCallback(
    btnKey => {
      // console.log("toggleCardSelection");
      if (!currentGame) return;

      const { isSingleCardMode, players, gameStatus } = currentGame;
      const playersMoreThanThree = players.length > 3;

      if (isSingleCardMode && btnKey === "secondGuessCardSet") {
        // console.log("error: only one card allowed");
        Notify.failure(t("err_only_one_card_allowed"));
        return;
      }

      const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
      const currentPlayer = players.find(p => p._id === playerId);
      const currentCard = currentPlayer?.hand[currentCardIndex];
      if (!currentCard) {
        // console.log("error: card not found");
        Notify.failure(t("err_card_not_found"));
        return;
      }

      if (gameStatus === GUESSING) {
        // console.log("gameStatus === GUESSING");
        // Встановлення локального стану карток:
        const isSelected =
          firstGuessCardSet?._id === currentCard._id ||
          secondGuessCardSet?._id === currentCard._id;

        if (isSelected && cardsSet[btnKey]?._id === currentCard._id) {
          dispatch(
            setCardsSet({
              gameId,
              playerId,
              cardsSet: { ...cardsSet, [btnKey]: null },
            }),
          );

          return;
        }

        const otherCard =
          btnKey === "firstGuessCardSet"
            ? secondGuessCardSet
            : firstGuessCardSet;

        // Якщо картки не обрані
        if (!firstGuessCardSet || !secondGuessCardSet) {
          // Коли гравців троє, то в комірках мають бути різні карти:
          if (!playersMoreThanThree && otherCard?._id === currentCard._id) {
            Notify.failure(t("err_cards_must_be_different"));
            // console.log("error: cards must be different");
          } else {
            dispatch(
              setCardsSet({
                gameId,
                playerId,
                cardsSet: { ...cardsSet, [btnKey]: currentCard },
              }),
            );
          }
        }
      } else if (gameStatus === LOBBY) {
        // console.log("gameStatus === LOBBY");
        if (currentCard._id === selectedCardId) {
          // console.log("removeSelectedCardId");
          dispatch(removeSelectedCardId({ gameId, playerId })); // clear
        } else {
          // console.log("setSelectedCardId");
          dispatch(
            setSelectedCardId({
              gameId,
              playerId,
              selectedCardId: currentCard._id,
            }),
          );
        }
      }
    },
    [
      cardsSet,
      currentGame,
      dispatch,
      emblaApiCardsGuess,
      firstGuessCardSet,
      gameId,
      playerId,
      secondGuessCardSet,
      selectedCardId,
      t,
    ],
  );

  //~ Close carousel when mask is showed
  useEffect(() => {
    if (isShowMask) carouselModeOff();
  }, [carouselModeOff, isShowMask]);

  //~ reInit for emblaApiCardsGuess
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    emblaApiCardsGuess.reInit({
      watchDrag: isCarouselModeHandScreen,
    });
  }, [emblaApiCardsGuess, isCarouselModeHandScreen]);

  // // ??
  // useEffect(() => {
  //   if (gameStatus === GUESSING) dispatch(removeSelectedCardId({ gameId, playerId })); // todo перевірити чи потрібно ще?
  // }, [dispatch, gameId, gameStatus, playerId]);

  //~ Get active card's index
  useEffect(() => {
    if (!emblaApiCardsGuess) return;

    const onSelect = () =>
      setActiveCardIdx(emblaApiCardsGuess.selectedScrollSnap());
    emblaApiCardsGuess.on("select", onSelect); // Підписка на подію зміни слайда

    return () => emblaApiCardsGuess.off("select", onSelect);
  }, [emblaApiCardsGuess]);

  //~ KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApiCardsGuess) return;
      if (event.key === "ArrowLeft") emblaApiCardsGuess.scrollPrev();
      else if (event.key === "ArrowRight") emblaApiCardsGuess.scrollNext();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApiCardsGuess]);

  //~ set BackButton
  useEffect(() => {
    if (isCarouselModeHandScreen) {
      showBackButton({ onClick: carouselModeOff, priority: 2 }); // Показуємо кнопку "Назад"
    } else {
      hideBackButton({ priority: 2 }); // Приховуємо кнопку, коли карусель закрита
    }

    return () => hideBackButton(2); // Очищення при демонтажі
  }, [
    isCarouselModeHandScreen,
    showBackButton,
    hideBackButton,
    carouselModeOff,
  ]);

  //* setMiddleButton
  useEffect(() => {
    if (!isActiveScreen || !currentGame) return;

    const { gameStatus, storytellerId, players, hostPlayerId } = currentGame;
    const currentPlayer = players.find(p => p._id === playerId);
    const isCurrentPlayerHost = hostPlayerId === playerId;
    const isCurrentPlayerGuessed = players.some(
      p => p._id === playerId && p.isGuessed,
    );
    const playersMoreThanThree = players.length > 3;
    const isCurrentPlayerStoryteller = storytellerId === playerId;
    const storyteller = players.find(p => p._id === storytellerId);

    if (isCarouselModeHandScreen) {
      // console.log("Carousel Mode");
      const activeCard = currentPlayer?.hand[activeCardIdx];
      if (!activeCard) {
        // console.log("error: card not found");
        Notify.failure(t("err_card_not_found"));
        return;
      }

      const isCanGuess = () => {
        if (!playersMoreThanThree) {
          return !!firstGuessCardSet?._id && !!secondGuessCardSet?._id;
        } else {
          return !!firstGuessCardSet?._id;
        }
      };

      const isDisabledFirstBtn = () => {
        const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
        const currentCard = currentPlayer?.hand[currentCardIndex];

        if (!currentCard) {
          // console.log("error: card not found");
          Notify.failure(t("err_card_not_found"));
          return;
        }

        if (gameStatus === LOBBY)
          return selectedCardId && selectedCardId !== currentCard._id;

        if (gameStatus === GUESSING) {
          if (playersMoreThanThree)
            return (
              firstGuessCardSet && firstGuessCardSet._id !== activeCard._id
            );
          else
            return (
              (firstGuessCardSet && firstGuessCardSet._id !== activeCard._id) ||
              (!firstGuessCardSet &&
                secondGuessCardSet &&
                secondGuessCardSet._id === activeCard._id)
            );
        }
      };

      const isDisabledSecondBtn = () => {
        return playersMoreThanThree
          ? secondGuessCardSet && secondGuessCardSet._id !== activeCard._id
          : (secondGuessCardSet && secondGuessCardSet._id !== activeCard._id) ||
              (!secondGuessCardSet &&
                firstGuessCardSet &&
                firstGuessCardSet._id === activeCard._id);
      };

      if (isCurrentPlayerGuessed) setMiddleButton(null);

      if (!isCurrentPlayerGuessed) {
        const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
        const currentCard = currentPlayer.hand[currentCardIndex];

        setMiddleButton(
          <>
            {!storytellerId ||
            (!isCurrentPlayerStoryteller && storyteller?.isGuessed) ? (
              <>
                <button
                  className={clsx(
                    css.btn,
                    (firstGuessCardSet || selectedCardId) &&
                      currentCard?._id === firstGuessCardSet?._id &&
                      css.btnActive,
                  )}
                  onClick={handleStory}
                  disabled={
                    isDisabledFirstBtn() ||
                    isCurrentPlayerGuessed ||
                    (!selectedCardId && !isCanGuess())
                  }>
                  {gameStatus === LOBBY
                    ? t("select_this_card")
                    : t("choose_card")}
                </button>

                {!playersMoreThanThree &&
                  (gameStatus === LOBBY ? (
                    ""
                  ) : (
                    <button
                      className={clsx(
                        css.btn,
                        secondGuessCardSet && css.btnActive,
                      )}
                      onClick={() => toggleCardSelection("secondGuessCardSet")}
                      disabled={
                        isDisabledSecondBtn() || isCurrentPlayerGuessed
                      }>
                      {t("choose_card")}
                    </button>
                  ))}
              </>
            ) : (
              isCurrentPlayerStoryteller &&
              !currentPlayer?.isGuessed && (
                <>
                  <button
                    className={clsx(
                      css.btn,
                      (firstGuessCardSet || selectedCardId) &&
                        currentCard?._id === firstGuessCardSet?._id &&
                        css.btnActive,
                    )}
                    // onClick={() => toggleCardSelection("firstGuessCardSet")}
                    onClick={handleStory}
                    disabled={
                      isDisabledFirstBtn() ||
                      isCurrentPlayerGuessed ||
                      (!selectedCardId && !isCanGuess())
                    }>
                    {t("select_this_card")}
                  </button>
                </>
              )
            )}
          </>,
        );
      }
    }

    const isReadyToVote = !players.some(player => !player.isGuessed);
    const isReadyToCalculatePoints = players.every(player => player.isVoted);
    if (!isCarouselModeHandScreen) {
      // console.log("Non Carousel Mode");
      setMiddleButton(null); // обнуляю кнопку для усіх при старті нового раунду

      if (isShowMask) {
        // console.log("isShowMask");
        if (isCurrentPlayerStoryteller) {
          // console.log("returnToHand() for isCurrentPlayerStoryteller ");
          returnToHand(); // для оповідача екран-маска автоматично закривається
        } else {
          // console.log("set Mask for other players");
          // Для інших гравців показується екран-маска, та кнопка закриття маски:
          setMiddleButton(
            <Button btnText={t("go_to_guess_story")} onClick={returnToHand} />,
          );
        }
      } else if (
        isCurrentPlayerHost &&
        isReadyToVote &&
        gameStatus === GUESSING
      ) {
      } else if (
        isCurrentPlayerHost &&
        isReadyToCalculatePoints &&
        gameStatus === VOTING
      ) {
      } else if (isCurrentPlayerHost && gameStatus === ROUND_RESULTS) {
        // console.log("це хост і можна починати новий раунд");
        setMiddleButton(
          <Button
            btnText={t("start_new_round")}
            onClick={startNewRound}
            disabled={gameStatus === FINISH}
          />,
        );
      } else {
        if (isCurrentPlayerStoryteller && gameStatus === !LOBBY) {
          // console.log("встановлюю кнопку в нуль для оповідача");
          setMiddleButton(null);
        } else {
          if (gameStatus === LOBBY) {
            // console.log("gameStatus LOBBY - встановити кнопку tell your story");
            if (
              !storytellerId ||
              (storytellerId && isCurrentPlayerStoryteller)
            ) {
            }
          } else if (gameStatus === GUESSING) {
            // console.log("блок для gameStatus GUESSING");

            if (!isCurrentPlayerGuessed) {
            } else {
              setMiddleButton(null);
            }
          } else setMiddleButton(null);
        }
      }
    }
  }, [
    activeCardIdx,
    currentGame,
    emblaApiCardsGuess,
    firstGuessCardSet,
    carouselModeOff,
    handleStory,
    isActiveScreen,
    isCarouselModeHandScreen,
    isShowMask,
    playerId,
    returnToHand,
    secondGuessCardSet,
    selectedCardId,
    setMiddleButton,
    startNewRound,
    t,
    toggleCardSelection,
  ]);

  // Set star(s) to card(s):
  const getStarsMarksByCardId = cardId => {
    if (!currentGame) return;
    const marks = [];

    if (currentGame.gameStatus === LOBBY) {
      if (selectedCardId === cardId) {
        marks.push(
          <MdCheck className={css.checkboxCard} style={{ color: "white" }} />,
        );
      }
    } else {
      if (firstGuessCardSet?._id === cardId)
        marks.push(<MdCheck className={css.checkboxCard} />);
      if (secondGuessCardSet?._id === cardId)
        marks.push(<MdCheck className={css.checkboxCard} />);
    }

    return marks;
  };

  // ^Render
  if (!currentGame) return null;

  const { players, storytellerId, gameStatus } = currentGame;
  const isCurrentPlayerStoryteller = storytellerId === playerId;

  if (!isCurrentPlayerStoryteller && isShowMask) {
    return (
      <div className={css.maskContainer}>
        <Mask
          rotation={30}
          top={50}
          left={50}
          translate={50}
          position="absolute"
        />
      </div>
    );
  }

  const currentPlayer = players.find(p => p._id === playerId);
  const { isGuessed, isVoted } = currentPlayer;
  const storyteller = players.find(p => p._id === storytellerId);

  const handleCardClick = () => {
    // console.log("handleCardClick");
    if (
      (gameStatus === GUESSING && !isGuessed) ||
      (gameStatus === VOTING && !isVoted) ||
      (gameStatus === LOBBY && isCurrentPlayerStoryteller && !isVoted) ||
      (gameStatus === LOBBY && !storyteller)
    )
      toggleCardSelection("firstGuessCardSet");
  };
  return (
    <>
      {isCarouselModeHandScreen && (
        <div className={css.cardWrap}>
          <div className={css.carousel} ref={emblaRefCardsGuess}>
            <ul className={css.carouselContainer}>
              {currentPlayer?.hand.map(card => {
                const marks = getStarsMarksByCardId(card._id);

                return (
                  <li
                    className={css.carouselSlide}
                    key={card._id}
                    onClick={handleCardClick}>
                    <div
                      className={clsx(css.slideContainer, {
                        [css.slideContainerActive]: marks.length > 0,
                      })}>
                      <ImgGen
                        className={css.carouselImage}
                        publicId={card.public_id}
                        isBig
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {!isCarouselModeHandScreen && (
        <>
          <div className={css.nonCarouselContainer}>
            <ul className={css.currentDeckContainer}>
              {currentPlayer?.hand.map((card, idx) => {
                const marks = getStarsMarksByCardId(card._id);

                return (
                  <li
                    className={clsx(css.card, {
                      [css.slideContainerActive]: marks.length > 0,
                    })}
                    key={card._id}
                    onClick={() => carouselModeOn(idx)}>
                    <ImgGen
                      className={css.img}
                      publicId={card.public_id}
                      isNeedPreload={true}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
