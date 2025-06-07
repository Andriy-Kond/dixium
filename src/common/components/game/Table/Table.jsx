import useEmblaCarousel from "embla-carousel-react";
import { Notify } from "notiflix";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  selectIsCarouselModeTableScreen,
  selectIsShowMask,
  selectLocalGame,
  selectUserCredentials,
  selectVotesLocal,
} from "redux/selectors.js";
import {
  FINISH,
  GUESSING,
  ROUND_RESULTS,
  VOTING,
} from "utils/generals/constants.js";
import Mask from "common/components/game/Mask";
import Button from "common/components/ui/Button/index.js";
import { useVote } from "hooks/useVote.js";
import css from "./Table.module.scss";
import {
  setIsCarouselModeTableScreen,
  updateVotesLocal,
} from "redux/game/localPersonalSlice.js";
import { capitalizeWords } from "utils/game/capitalizeWords.js";
import { useStartNewRound } from "hooks/useStartNewRound.js";
import { useTranslation } from "react-i18next";
import ImgGen from "common/components/ui/ImgGen";
import clsx from "clsx";
import { useBackButton } from "context/BackButtonContext.jsx";
import { MdStar } from "react-icons/md";

export default function Table({
  isActiveScreen,
  setMiddleButton,
  startVoting,
  finishRound,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showBackButton, hideBackButton } = useBackButton();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const { gameId } = useParams();
  const currentGame = useSelector(selectLocalGame(gameId));
  const isShowMask = useSelector(selectIsShowMask(gameId, playerId));
  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  const playerVotes = useSelector(selectVotesLocal(gameId, playerId));
  const { firstVotedCardId, secondVotedCardId } = playerVotes;
  const isCarouselModeTableScreen = useSelector(
    selectIsCarouselModeTableScreen(gameId, playerId),
  );

  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

  const vote = useVote(gameId, firstVotedCardId, secondVotedCardId);
  const startNewRound = useStartNewRound(gameId);

  const [emblaRefCardsVote, emblaApiCardsVote] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeTableScreen,
    // inViewThreshold: 0.5,
  });

  const handleVote = useCallback(() => {
    // console.log("handleVote");
    vote();
  }, [vote]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);

    dispatch(
      setIsCarouselModeTableScreen({
        gameId,
        playerId,
        isCarouselModeTableScreen: true,
      }),
    );

    setActiveCardIdx(idx);
  };

  const carouselModeOff = useCallback(() => {
    dispatch(
      setIsCarouselModeTableScreen({
        gameId,
        playerId,
        isCarouselModeTableScreen: false,
      }),
    );
  }, [dispatch, gameId, playerId]);

  //~ Close carousel when mask is showed
  useEffect(() => {
    if (isShowMask) carouselModeOff();
  }, [carouselModeOff, isShowMask]);

  //~ reInit for emblaApiCardsVote
  useEffect(() => {
    if (!emblaApiCardsVote) return;

    emblaApiCardsVote.reInit({
      watchDrag: isCarouselModeTableScreen,
    });
  }, [emblaApiCardsVote, isCarouselModeTableScreen]);

  useEffect(() => {
    if (emblaApiCardsVote) emblaApiCardsVote.scrollTo(activeCardIdx);
  }, [activeCardIdx, emblaApiCardsVote]);

  //~ Get active card's index
  useEffect(() => {
    if (!emblaApiCardsVote) return;

    const onSelect = () =>
      setActiveCardIdx(emblaApiCardsVote.selectedScrollSnap());
    emblaApiCardsVote.on("select", onSelect); // Підписка на подію зміни слайда

    return () => emblaApiCardsVote.off("select", onSelect);
  }, [emblaApiCardsVote]);

  //~ KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApiCardsVote) return;
      if (event.key === "ArrowLeft") emblaApiCardsVote.scrollPrev();
      else if (event.key === "ArrowRight") emblaApiCardsVote.scrollNext();
    };
    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApiCardsVote]);

  //~ set BackButton
  useEffect(() => {
    if (isCarouselModeTableScreen) {
      showBackButton({ onClick: carouselModeOff, priority: 2 }); // Показуємо кнопку "Назад"
    } else {
      hideBackButton(2); // Приховуємо кнопку, коли карусель закрита
    }

    return () => hideBackButton({ priority: 2 }); // Очищення при демонтажі
  }, [
    carouselModeOff,
    hideBackButton,
    isCarouselModeTableScreen,
    showBackButton,
  ]);

  // select card(s)
  const toggleCardSelection = useCallback(
    btnKey => {
      if (!currentGame) return;
      const currentCardIndex = emblaApiCardsVote?.selectedScrollSnap() || 0;
      const currentCard = currentGame.cardsOnTable[currentCardIndex];

      if (!currentCard) {
        // console.log("error: card not found");
        Notify.failure(t("err_card_not_found"));
        return;
      }

      const isSelected =
        firstVotedCardId === currentCard._id ||
        secondVotedCardId === currentCard._id;

      const fieldToUpdate =
        btnKey === "firstVoteCardSet"
          ? "firstVotedCardId"
          : "secondVotedCardId";

      const currentVote = playerVotes[fieldToUpdate];

      const updatedVotes = {
        ...playerVotes,
        [fieldToUpdate]:
          isSelected && currentVote === currentCard._id
            ? null // Знімаємо вибір
            : !firstVotedCardId || !secondVotedCardId
            ? currentCard._id // Додаємо вибір, якщо є вільний слот
            : currentVote, // Залишаємо як є, якщо слоти зайняті
      };

      dispatch(
        updateVotesLocal({
          gameId,
          playerId,
          firstVotedCardId: updatedVotes.firstVotedCardId,
          secondVotedCardId: updatedVotes.secondVotedCardId,
        }),
      );
    },
    [
      currentGame,
      dispatch,
      emblaApiCardsVote,
      firstVotedCardId,
      gameId,
      playerId,
      playerVotes,
      secondVotedCardId,
      t,
    ],
  );

  //* setMiddleButton
  useEffect(() => {
    if (!isActiveScreen || !currentGame) return;

    const {
      storytellerId,
      cardsOnTable,
      isSingleCardMode,
      gameStatus,
      players,
      hostPlayerId,
    } = currentGame;
    const isCurrentPlayerStoryteller = storytellerId === playerId;
    const playersMoreThanSix = players.length > 6;
    const isStartVotingDisabled = players.some(player => !player.isGuessed);

    const isCanVote =
      playersMoreThanSix && !isSingleCardMode
        ? !!firstVotedCardId && !!secondVotedCardId
        : !!firstVotedCardId;

    const isCurrentPlayerVoted = players.some(
      player => player._id === playerId && player.isVoted,
    );

    const isCurrentPlayerHost = hostPlayerId === playerId;

    if (isCarouselModeTableScreen) {
      // console.log("Table: Carousel Mode");
      setMiddleButton(null);

      if (gameStatus !== ROUND_RESULTS && !isCurrentPlayerStoryteller) {
        const activeCard = cardsOnTable[activeCardIdx];
        if (!activeCard) {
          // console.log("error: card not found");
          Notify.failure(t("err_card_not_found"));
          return;
        }

        const isDisabledFirstBtn =
          (firstVotedCardId && firstVotedCardId !== activeCard._id) ||
          playerId === activeCard.ownerId;

        const isDisabledSecondBtn =
          (secondVotedCardId && secondVotedCardId !== activeCard._id) ||
          playerId === activeCard.ownerId;

        const currentCardIndex = emblaApiCardsVote?.selectedScrollSnap() || 0;
        const currentCard = cardsOnTable[currentCardIndex];

        setMiddleButton(
          <div className={css.carouselModeBtnsWrapper}>
            <Button
              localClassName={clsx(
                css.btn,
                firstVotedCardId &&
                  currentCard._id === firstVotedCardId &&
                  css.btnActive,
              )}
              btnStyle={["twoBtnsInRow"]}
              onClick={() => toggleCardSelection("firstVoteCardSet")}
              disabled={isDisabledFirstBtn || isCurrentPlayerVoted}>
              <MdStar className={css.btnStarIcon} />
            </Button>

            {playersMoreThanSix && !isSingleCardMode && (
              <Button
                localClassName={clsx(
                  css.btn,
                  secondVotedCardId &&
                    currentCard._id === secondVotedCardId &&
                    css.btnActive,
                )}
                btnStyle={["twoBtnsInRow"]}
                onClick={() => toggleCardSelection("secondVoteCardSet")}
                disabled={isDisabledSecondBtn || isCurrentPlayerVoted}>
                <MdStar className={css.btnStarIcon} />
              </Button>
            )}
          </div>,
        );
      }
    }

    const isReadyToVote = !players.some(player => !player.isGuessed);
    const isReadyToCalculatePoints = players.every(player => player.isVoted);

    if (!isCarouselModeTableScreen) {
      // console.log("Non Carousel Mode");
      setMiddleButton(null); // обнуляю кнопку для усіх при старті нового раунду
      if (
        gameStatus === VOTING &&
        !isCurrentPlayerVoted &&
        !isCurrentPlayerStoryteller
      ) {
        // Якщо це не сторітеллер і може голосувати (вже обрані карти)
        setMiddleButton(
          <Button
            btnText={t("vote")}
            onClick={handleVote}
            disabled={!isCanVote || isCurrentPlayerVoted}
          />,
        );
      } else if (isCurrentPlayerHost) {
        if (gameStatus === GUESSING && isReadyToVote) {
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
          // console.log("це хост і всі обрали проголосували - можна рахувати бали");
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
  }, [
    activeCardIdx,
    currentGame,
    emblaApiCardsVote,
    finishRound,
    firstVotedCardId,
    handleVote,
    isActiveScreen,
    isCarouselModeTableScreen,
    playerId,
    secondVotedCardId,
    setMiddleButton,
    startNewRound,
    startVoting,
    t,
    toggleCardSelection,
  ]);

  const getMarksByVoteCount = voteCount => {
    const marksVote = [];
    if (voteCount === 1) {
      marksVote.push(<MdStar className={css.iconStar2} />);
    }

    if (voteCount === 2) {
      marksVote.push(<MdStar className={css.iconStar2} />);
      marksVote.push(<MdStar className={css.iconStar2} />);
    }

    return marksVote;
  };

  const getStarsMarksByCardId = cardId => {
    const marks = [];

    if (firstVotedCardId === cardId) {
      marks.push(<MdStar className={css.iconStar2} />);
    }

    if (secondVotedCardId === cardId) {
      marks.push(<MdStar className={css.iconStar2} />);
    }

    return marks;
  };

  //^ Render
  if (!currentGame) return null;

  const { gameStatus, cardsOnTable, roundResults, storytellerId } = currentGame;

  if (gameStatus === VOTING) {
    return (
      <>
        {isCarouselModeTableScreen && (
          <div className={css.carWrap}>
            <div className={css.carousel} ref={emblaRefCardsVote}>
              <ul className={css.carouselContainer}>
                {cardsOnTable.map(card => {
                  const marks = getStarsMarksByCardId(card._id);

                  return (
                    <li className={css.carouselSlide} key={card._id}>
                      <ImgGen
                        className={css.carouselImage}
                        publicId={card.public_id}
                        isBig
                        isNeedPreload={true}
                      />
                      {marks.length > 0 && (
                        <div className={css.checkboxContainer2Carousel}>
                          {marks.map((mark, index) => (
                            <span key={index} className={css.checkboxCard2}>
                              {mark}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {!isCarouselModeTableScreen && (
          <div className={css.nonCarouselContainer}>
            <ul className={css.currentDeckContainer}>
              {cardsOnTable.map((card, idx) => {
                const marks = getStarsMarksByCardId(card._id);
                return (
                  <li
                    className={clsx(css.card, {
                      // [css.slideContainerActive]: card.ownerId === playerId,
                    })}
                    key={card._id}
                    onClick={() => carouselModeOn(idx)}>
                    <ImgGen
                      className={clsx(css.img, {
                        [css.slideContainerActive]: card.ownerId === playerId,
                      })}
                      publicId={card.public_id}
                      isNeedPreload={true}
                    />

                    {marks.length > 0 && (
                      <div className={css.checkboxContainer2NonCarousel}>
                        {getStarsMarksByCardId(card._id).map((mark, index) => (
                          <span key={index} className={css.checkboxCard}>
                            {mark}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </>
    );
  }

  if (gameStatus === ROUND_RESULTS) {
    return (
      <>
        {/* <p>Table gameStatus === ROUND_RESULTS</p> */}
        {isCarouselModeTableScreen && (
          <div className={css.carWrap}>
            <div className={css.carousel} ref={emblaRefCardsVote}>
              <ul className={css.carouselContainer}>
                {roundResults.map(card => {
                  const marks = getStarsMarksByCardId(card._id);

                  return (
                    <li className={css.carouselSlide} key={card._id}>
                      <ImgGen
                        className={css.carouselImage}
                        publicId={card.public_id}
                        isBig
                        isNeedPreload={true}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {!isCarouselModeTableScreen && (
          <ul className={css.resultList}>
            {roundResults.map((result, idx) => {
              return (
                <li
                  className={css.resultItem}
                  key={result.cardId}
                  onClick={() => carouselModeOn(idx)}>
                  <ImgGen
                    className={css.resultImg}
                    publicId={result.public_id}
                    isNeedPreload={true}
                  />
                  <div className={css.resultPlayers}>
                    <span className={css.playerName}>
                      {`[ ${result.ownerName.toUpperCase()} ]`}
                      {result.ownerId === storytellerId &&
                        ` (${t("storyteller").toLowerCase()})`}
                    </span>

                    <ul className={css.resultVotes}>
                      {result.votesForThisCard.map((vote, voteIdx) => {
                        const marksVote = getMarksByVoteCount(vote.voteCount);

                        return (
                          <li className={css.voterContainer} key={voteIdx}>
                            <span className={css.playerName}>
                              {capitalizeWords(vote.playerName)}
                            </span>
                            <div className={css.resultCheckboxContainer}>
                              {marksVote.map((mark, index) => (
                                <span key={index} className={css.iconStar2}>
                                  {mark}
                                </span>
                              ))}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  }

  return (
    <>
      {/* <p>Table default - cards face down</p> */}
      <ul className={css.currentDeckContainer}>
        {cardsOnTable.map((card, idx) => (
          <li className={css.card} key={card._id}>
            <Mask />
          </li>
        ))}
      </ul>
    </>
  );
}
