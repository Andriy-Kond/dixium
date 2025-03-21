import useEmblaCarousel from "embla-carousel-react";
import { Notify } from "notiflix";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectCardsOnTable,
  selectGamePlayers,
  selectGameStatus,
  selectHostPlayerId,
  selectIsSingleCardMode,
  selectStorytellerId,
  selectUserCredentials,
  selectVotesLocal,
} from "redux/selectors.js";
import { GUESSING, VOTING } from "utils/generals/constants.js";
import Mask from "common/components/game/Mask";
import Button from "common/components/ui/Button/index.js";
import { useVote } from "hooks/useVote.js";
import css from "./Table.module.scss";
import { updateVotesLocal } from "redux/game/localPersonalSlice.js";

export default function Table({
  isActiveScreen,
  setMiddleButton,
  isCarouselModeTableScreen,
  setIsCarouselModeTableScreen,
  startVoting,
  finishRound,
}) {
  const dispatch = useDispatch();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const { gameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  // const votes = useSelector(selectVotes(gameId));
  const playerVotes = useSelector(selectVotesLocal(gameId, playerId));
  // const interimVotesFromSelector = useSelector(
  //   selectVotesLocal(gameId, playerId),
  // );
  // const playerVotes = useMemo(
  //   () => interimVotesFromSelector || {},
  //   [interimVotesFromSelector],
  // );
  const { firstVotedCardId, secondVotedCardId } = playerVotes;

  // const playerVotes = useMemo(
  //   () => useSelector(selectVotesLocal(gameId, playerId)) || {},
  //   [gameId, playerId],
  // );

  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card
  const [isMounted, setIsMounted] = useState(false);

  const isCurrentPlayerStoryteller = storytellerId === playerId;
  // const playersMoreThanThree = gamePlayers.length > 3;
  const playersMoreThanSix = gamePlayers.length > 6;
  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const isReadyToCalculatePoints = gamePlayers.every(player => player.isVoted);
  const isStartVotingDisabled = gamePlayers.some(player => !player.isGuessed);

  //  Гравців === 3 - голосування за 1 карту.
  //  Гравців 3-6 - голосування за 1 карту
  //  Гравців 7-12 - голосування за 1 карту якщо режиму isSingleCardMode, інакше - за 2 карти

  const isCanVote =
    playersMoreThanSix && !isSingleCardMode
      ? !!firstVotedCardId && !!secondVotedCardId
      : !!firstVotedCardId;

  const isCurrentPlayerVoted = gamePlayers.some(
    player => player._id === playerId && player.isVoted,
  );

  // const vote = useVote(gameId, firstVotedCardId, secondVotedCardId);
  const vote = useVote(gameId, firstVotedCardId, secondVotedCardId);

  const [emblaRefCardsVote, emblaApiCardsVote] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
    watchDrag: isCarouselModeTableScreen,
    // inViewThreshold: 0.5,
  });

  const handleVote = useCallback(() => {
    console.log("handleVote");
    vote();
  }, [vote]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);
    setActiveCardIdx(idx);
    setIsCarouselModeTableScreen(true);
    setIsMounted(true);
  };

  const exitCarouselMode = useCallback(() => {
    setIsMounted(false);
    setIsCarouselModeTableScreen(false);
    setMiddleButton(null);
  }, [setIsCarouselModeTableScreen, setMiddleButton]);

  const getStarsMarks = useCallback(
    cardId => {
      const marks = [];

      if (firstVotedCardId === cardId) marks.push("★1");
      if (secondVotedCardId === cardId) marks.push("★2");
      return marks;
    },
    [firstVotedCardId, secondVotedCardId],
  );

  // select card(s)
  const toggleCardSelection = useCallback(
    btnKey => {
      const currentCardIndex = emblaApiCardsVote?.selectedScrollSnap() || 0;
      const currentCard = cardsOnTable[currentCardIndex];

      if (!currentCard) {
        Notify.failure("error: card not found");
        console.log("error: card not found");
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
      cardsOnTable,
      dispatch,
      emblaApiCardsVote,
      firstVotedCardId,
      gameId,
      playerId,
      playerVotes,
      secondVotedCardId,
    ],
  );

  // reInit for emblaApiCardsVote
  useEffect(() => {
    if (!emblaApiCardsVote) return;

    emblaApiCardsVote.reInit({
      watchDrag: isCarouselModeTableScreen,
    });
  }, [emblaApiCardsVote, isCarouselModeTableScreen]);

  useEffect(() => {
    if (emblaApiCardsVote) emblaApiCardsVote.scrollTo(activeCardIdx);
  }, [activeCardIdx, emblaApiCardsVote]);

  // Get active card's index
  useEffect(() => {
    if (!emblaApiCardsVote) return;

    const onSelect = () =>
      setActiveCardIdx(emblaApiCardsVote.selectedScrollSnap());
    emblaApiCardsVote.on("select", onSelect); // Підписка на подію зміни слайда

    return () => emblaApiCardsVote.off("select", onSelect);
  }, [emblaApiCardsVote]);

  // KB events handler
  useEffect(() => {
    const handleKeyPress = event => {
      if (!emblaApiCardsVote) return;
      if (event.key === "ArrowLeft") emblaApiCardsVote.scrollPrev();
      else if (event.key === "ArrowRight") emblaApiCardsVote.scrollNext();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [emblaApiCardsVote]);

  //* setMiddleButton
  useEffect(() => {
    if (!isActiveScreen) return;

    if (isCarouselModeTableScreen) {
      // Якщо це режим каруселі, то можна вгадувати карти на столі:
      const activeCard = cardsOnTable[activeCardIdx];
      if (!activeCard) {
        console.log("error: card not found");
        return;
      }

      const isDisabledFirstBtn =
        (firstVotedCardId && firstVotedCardId !== activeCard._id) ||
        playerId === activeCard.owner;
      const isDisabledSecondBtn =
        (secondVotedCardId && secondVotedCardId !== activeCard._id) ||
        playerId === activeCard.owner;

      setMiddleButton(
        <>
          <Button btnText="Back" onClick={exitCarouselMode} />

          <div style={{ display: "flex", flexDirection: "row" }}>
            {!isCurrentPlayerStoryteller && (
              <>
                <Button
                  btnText="★1"
                  onClick={() => toggleCardSelection("firstVoteCardSet")}
                  disabled={isDisabledFirstBtn || isCurrentPlayerVoted}
                  localClassName={firstVotedCardId && css.btnActive}
                />
                {playersMoreThanSix && (
                  <Button
                    btnText="★2"
                    onClick={() => toggleCardSelection("secondVoteCardSet")}
                    disabled={isDisabledSecondBtn || isCurrentPlayerVoted}
                    localClassName={secondVotedCardId && css.btnActive}
                  />
                )}
              </>
            )}
          </div>
        </>,
      );
    } // Якщо це режим "не карусель":
    else if (gameStatus === GUESSING) {
      if (hostPlayerId === playerId && isReadyToVote) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Start voting"}
            onClick={startVoting}
            disabled={isStartVotingDisabled}
          />,
        );
      } else setMiddleButton(null);
    } else if (gameStatus === VOTING) {
      if (hostPlayerId === playerId && isReadyToCalculatePoints) {
        // Якщо це ведучий:
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Finish round"}
            onClick={finishRound}
          />,
        );
      } else if (!isCurrentPlayerStoryteller && isCanVote) {
        // Якщо це не сторітеллер і може голосувати (вже обрані карти)
        setMiddleButton(
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText={"Vote card"}
            onClick={handleVote}
            disabled={!isCanVote || isCurrentPlayerVoted}
          />,
        );
      } else if (
        !storytellerId ||
        isCurrentPlayerStoryteller ||
        isCurrentPlayerVoted ||
        !isCanVote
      )
        setMiddleButton(null);
    } else setMiddleButton(null);
  }, [
    activeCardIdx,
    cardsOnTable,
    exitCarouselMode,
    finishRound,
    firstVotedCardId,
    gameStatus,
    handleVote,
    hostPlayerId,
    isActiveScreen,
    isCanVote,
    isCarouselModeTableScreen,
    isCurrentPlayerStoryteller,
    isCurrentPlayerVoted,
    isReadyToCalculatePoints,
    isReadyToVote,
    isStartVotingDisabled,
    playersMoreThanSix,
    secondVotedCardId,
    setMiddleButton,
    startVoting,
    storytellerId,
    toggleCardSelection,
    playerId,
  ]);

  return (
    <>
      <p>Table</p>

      {gameStatus === VOTING ? (
        <>
          <div>cards face up</div>

          {isCarouselModeTableScreen ? (
            <div className={css.carouselWrapper} ref={emblaRefCardsVote}>
              <ul className={css.carouselContainer}>
                {cardsOnTable.map((card, idx) => (
                  <li className={css.carouselSlide} key={card._id}>
                    <img
                      src={card.url}
                      alt="card"
                      className={`${css.carouselImage} ${
                        isMounted ? css.visible : ""
                      }`}
                    />
                    <div className={css.checkboxContainer}>
                      {getStarsMarks(card._id).map((mark, index) => (
                        <span key={index} className={css.carouselCheckbox}>
                          {mark}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className={`${css.currentDeck}`}>
              {cardsOnTable.map((card, idx) => (
                <li
                  className={css.card}
                  key={card._id}
                  onClick={() => carouselModeOn(idx)}>
                  <img className={css.img} src={card.url} alt="card" />

                  <div className={css.checkboxContainer}>
                    {getStarsMarks(card._id).map((mark, index) => (
                      <span key={index} className={css.checkboxCard}>
                        {mark}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className={css.cardsListFaceDown}>
          {cardsOnTable.map((card, idx) => (
            <li key={card._id}>
              <Mask
                rotation={30 + idx * 30}
                top={Math.round(Math.random() * (40 - 20 + 1)) + 20}
                left={Math.round(Math.random() * (40 - 20 + 1)) + 20}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
