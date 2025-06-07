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
  setStorytellerId,
} from "redux/game/localPersonalSlice.js";
import { useStartNewRound } from "hooks/useStartNewRound.js";
import { useTranslation } from "react-i18next";
import ImgGen from "common/components/ui/ImgGen";
import { useBackButton } from "context/BackButtonContext.jsx";
import clsx from "clsx";
import css from "./Hand.module.scss";

export default function Hand({
  isActiveScreen,
  setMiddleButton,
  startVoting,
  finishRound,
}) {
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

  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));

  const cardsSet = useSelector(selectCardsSet(gameId, playerId));
  const { firstGuessCardSet, secondGuessCardSet } = cardsSet;

  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

  const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeHandScreen,
  });

  const tellStory = useTellStory(gameId);
  const guessStory = useGuess(gameId);
  const startNewRound = useStartNewRound(gameId);

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

  useEffect(() => {
    if (emblaApiCardsGuess) emblaApiCardsGuess.scrollTo(activeCardIdx);
  }, [activeCardIdx, emblaApiCardsGuess]);

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

  //# для оповідача
  useEffect(() => {
    if (!currentGame) return;

    const { storytellerId, players } = currentGame;
    // console.log("storytellerId:::", storytellerId);

    const currentPlayer = players.find(p => p._id === playerId);
    if (currentPlayer?.isGuessed) return;

    const isCurrentPlayerStoryteller = storytellerId === playerId;
    // console.log("isCurrentPlayerStoryteller:::", isCurrentPlayerStoryteller);

    if (isCurrentPlayerStoryteller) {
      if (selectedCardId) {
        tellStory(selectedCardId);

        // закриваю карусель
        dispatch(
          setIsCarouselModeHandScreen({
            gameId,
            playerId,
            isCarouselModeHandScreen: false,
          }),
        );
      }
    }
  }, [currentGame, dispatch, gameId, playerId, selectedCardId, tellStory]);

  //# для інших гравців
  useEffect(() => {
    // console.log({ firstGuessCardSet, secondGuessCardSet });
    if (!currentGame) return;

    const { players, storytellerId, isSingleCardMode } = currentGame;
    const currentPlayer = players.find(p => p._id === playerId);
    if (currentPlayer?.isGuessed) return;

    const isCurrentPlayerStoryteller = storytellerId === playerId;
    const isPlayersMoreThanThree = players.length > 3;

    if (!isCurrentPlayerStoryteller) {
      if (!isPlayersMoreThanThree) {
        if (firstGuessCardSet && secondGuessCardSet) {
          guessStory({ firstGuessCardSet, secondGuessCardSet });

          // закриваю карусель
          dispatch(
            setIsCarouselModeHandScreen({
              gameId,
              playerId,
              isCarouselModeHandScreen: false,
            }),
          );
        }
      }

      if (isPlayersMoreThanThree) {
        if (isSingleCardMode) {
          if (firstGuessCardSet) {
            guessStory({ firstGuessCardSet, secondGuessCardSet: null });

            // закриваю карусель
            dispatch(
              setIsCarouselModeHandScreen({
                gameId,
                playerId,
                isCarouselModeHandScreen: false,
              }),
            );
          }
        } else {
          if (firstGuessCardSet && secondGuessCardSet) {
            guessStory({ firstGuessCardSet, secondGuessCardSet });

            // закриваю карусель
            dispatch(
              setIsCarouselModeHandScreen({
                gameId,
                playerId,
                isCarouselModeHandScreen: false,
              }),
            );
          }
        }
      }
    }
  }, [
    currentGame,
    dispatch,
    emblaApiCardsGuess,
    gameId,
    guessStory,
    playerId,
    firstGuessCardSet,
    secondGuessCardSet,
  ]);

  const handleBtn = useCallback(
    btnKey => {
      // console.log("handleBtn", btnKey);
      if (!currentGame) return;

      const { players, storytellerId, isSingleCardMode } = currentGame;
      const isCurrentPlayerStoryteller = storytellerId === playerId;
      const currentPlayer = players.find(p => p._id === playerId);
      const isPlayersMoreThanThree = players.length > 3;
      const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
      const currentCard = currentPlayer?.hand[currentCardIndex];

      if (!currentCard) {
        console.log("error: card not found");
        Notify.failure(t("err_card_not_found"));
        return;
      }

      //# Для оповідача або Якщо оповідача ще нема
      if (isCurrentPlayerStoryteller || !storytellerId) {
        dispatch(
          setSelectedCardId({
            gameId,
            playerId,
            selectedCardId: currentCard._id,
          }),
        );

        // якщо оповідач ще не визначений
        !storytellerId &&
          dispatch(
            setStorytellerId({ gameId, storytellerId: currentPlayer._id }),
          );
        return;
      }

      //# для інших гравців
      if (!isCurrentPlayerStoryteller) {
        // В режимі однієї карти обрати другу неможливо
        if (isSingleCardMode && btnKey === "secondGuessCardSet") {
          console.log("error: only one card allowed");
          Notify.failure(t("err_only_one_card_allowed"));
          return;
        }

        const otherCard =
          btnKey === "firstGuessCardSet"
            ? secondGuessCardSet
            : firstGuessCardSet;

        if (!isPlayersMoreThanThree) {
          if (!firstGuessCardSet || !secondGuessCardSet) {
            // Коли гравців троє, то в комірках мають бути різні карти:
            if (otherCard?._id === currentCard._id) {
              Notify.failure(t("err_cards_must_be_different"));
              // console.log("error: cards must be different");
              return;
            }
          }

          dispatch(
            setCardsSet({
              gameId,
              playerId,
              cardsSet: { ...cardsSet, [btnKey]: currentCard },
            }),
          );
          // setCardsSet({ ...cardsSet, [btnKey]: currentCard });

          if (firstGuessCardSet && secondGuessCardSet) {
            guessStory({ firstGuessCardSet, secondGuessCardSet });

            // закриваю карусель
            dispatch(
              setIsCarouselModeHandScreen({
                gameId,
                playerId,
                isCarouselModeHandScreen: false,
              }),
            );

            return;
          }
        }

        if (isPlayersMoreThanThree) {
          if (isSingleCardMode) {
            if (firstGuessCardSet) {
              guessStory({ firstGuessCardSet, secondGuessCardSet: null });

              // закриваю карусель
              dispatch(
                setIsCarouselModeHandScreen({
                  gameId,
                  playerId,
                  isCarouselModeHandScreen: false,
                }),
              );

              return;
            }
          } else {
            if (firstGuessCardSet && secondGuessCardSet) {
              guessStory({ firstGuessCardSet, secondGuessCardSet });

              // закриваю карусель
              dispatch(
                setIsCarouselModeHandScreen({
                  gameId,
                  playerId,
                  isCarouselModeHandScreen: false,
                }),
              );

              return;
            }
          }
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
      guessStory,
      playerId,
      secondGuessCardSet,
      t,
    ],
  );

  //* setMiddleButton
  useEffect(() => {
    if (!isActiveScreen || !currentGame) return;

    const { gameStatus, storytellerId, players, hostPlayerId } = currentGame;
    const currentPlayer = players.find(p => p._id === playerId);
    const isCurrentPlayerHost = hostPlayerId === playerId;
    const isCurrentPlayerGuessed = players.some(
      p => p._id === playerId && p.isGuessed,
    );
    const isPlayersMoreThanThree = players.length > 3;
    const isCurrentPlayerStoryteller = storytellerId === playerId;
    const storyteller = players.find(p => p._id === storytellerId);

    if (isShowMask) {
      // console.log("isShowMask");
      if (isCurrentPlayerStoryteller) {
        // console.log("returnToHand() for isCurrentPlayerStoryteller ");
        returnToHand(); // для оповідача екран-маска автоматично закривається
      } else {
        // console.log("set Mask for other players");
        // Для інших гравців показується екран-маска, та кнопка закриття маски:
        setMiddleButton(
          <button className={css.btn} onClick={returnToHand}>
            {t("go_to_guess_story")}
          </button>,
        );
      }
    }

    if (!isShowMask) {
      if (isCarouselModeHandScreen) {
        // console.log("Carousel Mode");
        const activeCard = currentPlayer?.hand[activeCardIdx];
        if (!activeCard) {
          // console.log("error: card not found");
          Notify.failure(t("err_card_not_found"));
          return;
        }

        const isCanGuess = () => {
          if (!isPlayersMoreThanThree) {
            return !!firstGuessCardSet?._id && !!secondGuessCardSet?._id;
          } else {
            return !!firstGuessCardSet?._id;
          }
        };

        const isDisabledFirstBtn = () => {
          const currentCardIndex =
            emblaApiCardsGuess?.selectedScrollSnap() || 0;
          const currentCard = currentPlayer?.hand[currentCardIndex];

          if (!currentCard) {
            // console.log("error: card not found");
            Notify.failure(t("err_card_not_found"));
            return;
          }

          if (gameStatus === LOBBY)
            return selectedCardId && selectedCardId !== currentCard._id;

          if (gameStatus === GUESSING) {
            if (isPlayersMoreThanThree)
              return (
                firstGuessCardSet && firstGuessCardSet._id !== activeCard._id
              );
            else
              return (
                (firstGuessCardSet &&
                  firstGuessCardSet._id !== activeCard._id) ||
                (!firstGuessCardSet &&
                  secondGuessCardSet &&
                  secondGuessCardSet._id === activeCard._id)
              );
          }
        };

        const isDisabledSecondBtn = () => {
          return isPlayersMoreThanThree
            ? secondGuessCardSet && secondGuessCardSet._id !== activeCard._id
            : (secondGuessCardSet &&
                secondGuessCardSet._id !== activeCard._id) ||
                (!secondGuessCardSet &&
                  firstGuessCardSet &&
                  firstGuessCardSet._id === activeCard._id);
        };

        if (isCurrentPlayerGuessed) setMiddleButton(null);

        if (!isCurrentPlayerGuessed) {
          const currentCardIndex =
            emblaApiCardsGuess?.selectedScrollSnap() || 0;
          const currentCard = currentPlayer.hand[currentCardIndex];

          if (
            !storytellerId ||
            (!isCurrentPlayerStoryteller && storyteller?.isGuessed)
          ) {
            // Це не оповідач, а оповідач вже проголосував, або оповідача ще немає
            const btnText =
              gameStatus === LOBBY ? t("tell_your_story") : t("choose_card");

            setMiddleButton(
              <div className={css.twoBtnInRow}>
                <button
                  className={clsx(
                    css.btn,
                    // (firstGuessCardSet || selectedCardId) &&
                    //   currentCard?._id === firstGuessCardSet?._id &&
                    //   css.btnActive,
                  )}
                  onClick={() => handleBtn("firstGuessCardSet")}
                  disabled={
                    isDisabledFirstBtn() ||
                    isCurrentPlayerGuessed ||
                    firstGuessCardSet
                  }
                  // disabled={
                  //   isDisabledFirstBtn() ||
                  //   isCurrentPlayerGuessed ||
                  //   (!selectedCardId && !isCanGuess()) // todo перевірити цю умову disabled для інших станів
                  // }
                >
                  {btnText}
                </button>

                {!isPlayersMoreThanThree &&
                  (gameStatus === LOBBY ? (
                    ""
                  ) : (
                    <button
                      className={clsx(
                        css.btn,
                        // secondGuessCardSet && css.btnActive,
                      )}
                      onClick={() => handleBtn("secondGuessCardSet")}
                      disabled={
                        isDisabledSecondBtn() ||
                        isCurrentPlayerGuessed ||
                        secondGuessCardSet
                      }
                      // disabled={
                      //   isDisabledSecondBtn() || isCurrentPlayerGuessed
                      // }
                    >
                      {btnText}
                    </button>
                  ))}
              </div>,
            );
          } else if (isCurrentPlayerStoryteller && !currentPlayer?.isGuessed) {
            // це сторітеллер і він ще не обрав асоціацію
            setMiddleButton(
              <button
                className={clsx(
                  css.btn,
                  (firstGuessCardSet || selectedCardId) &&
                    currentCard?._id === firstGuessCardSet?._id &&
                    css.btnActive,
                )}
                // onClick={() => toggleCardSelection("firstGuessCardSet")}
                onClick={() => handleBtn("firstGuessCardSet")}
                disabled={isCurrentPlayerGuessed}
                // disabled={
                //   isDisabledFirstBtn() ||
                //   isCurrentPlayerGuessed ||
                //   (!selectedCardId && !isCanGuess())
                // }
              >
                {t("select_this_card")}
              </button>,
            );
          }
        }
      }

      const isReadyToVote = !players.some(player => !player.isGuessed);
      const isReadyToCalculatePoints = players.every(player => player.isVoted);
      if (!isCarouselModeHandScreen) {
        // console.log("Non Carousel Mode");
        setMiddleButton(null); // обнуляю кнопку для усіх при старті нового раунду

        if (isCurrentPlayerHost) {
          if (gameStatus === GUESSING && isReadyToVote) {
            const isStartVotingDisabled = players.some(
              player => !player.isGuessed,
            );
            // console.log("це хост і всі обрали карти - готові до голосування");
            setMiddleButton(
              <button
                className={css.btn}
                onClick={startVoting}
                disabled={isStartVotingDisabled}>
                {t("start_voting")}
              </button>,
            );
          }

          if (gameStatus === VOTING && isReadyToCalculatePoints) {
            // console.log("це хост і всі проголосували - можна рахувати бали");
            setMiddleButton(
              <button className={css.btn} onClick={finishRound}>
                {t("finish_round")}
              </button>,
            );
          }

          if (gameStatus === ROUND_RESULTS) {
            setMiddleButton(
              <button
                className={css.btn}
                onClick={startNewRound}
                disabled={gameStatus === FINISH}>
                {t("start_new_round")}
              </button>,
            );
          }
        } else setMiddleButton(null);
      }
    }
  }, [
    activeCardIdx,
    currentGame,
    emblaApiCardsGuess,
    finishRound,
    firstGuessCardSet,
    handleBtn,
    isActiveScreen,
    isCarouselModeHandScreen,
    isShowMask,
    playerId,
    returnToHand,
    secondGuessCardSet,
    setMiddleButton,
    startNewRound,
    startVoting,
    selectedCardId,
    t,
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
                    // onClick={handleCardClick}
                  >
                    <div
                      className={clsx(css.slideContainer, {
                        [css.slideContainerActive]: marks.length > 0,
                      })}>
                      <ImgGen
                        className={css.carouselImage}
                        publicId={card.public_id}
                        isBig
                        isNeedPreload={true}
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
