import useEmblaCarousel from "embla-carousel-react";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectCardsOnTable,
  selectGamePlayers,
  selectGameStatus,
  selectHostPlayerId,
  selectIsSingleCardMode,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import Mask from "common/components/game/Mask";
import css from "./Table.module.scss";
import Button from "common/components/ui/Button/index.js";
import { VOTING } from "utils/generals/constants.js";

export default function Table({
  isActiveScreen,
  setMiddleButton,
  isCarouselModeTableScreen,
  setIsCarouselModeTableScreen,
  calculateRoundPoints,
  isCarouselModeHandScreen,
}) {
  const { gameId } = useParams();
  const gameStatus = useSelector(selectGameStatus(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const hostPlayerId = useSelector(selectHostPlayerId(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const isCurrentPlayerStoryteller = storytellerId === userCredentials._id;
  const playersMoreThanThree = gamePlayers.length > 3;
  const [cardsSet, setCardsSet] = useState({
    firstCard: null,
    secondCard: null,
  });
  const { firstCard, secondCard } = cardsSet;

  const isReadyToVote = !gamePlayers.some(player => !player.isGuessed);
  const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
  const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

  const isCanVote =
    playersMoreThanThree && isSingleCardMode
      ? !!firstCard?._id
      : !!firstCard?._id && !!secondCard?._id;

  const isCurrentPlayerVoted = gamePlayers.some(
    player => player._id === userCredentials._id && player.isVoted,
  );

  const [emblaRefCardsVote, emblaApiCardsVote] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: selectedCardIdx,
  });

  const toggleCardSelection = useCallback(
    btnKey => {
      if (isSingleCardMode && btnKey === "secondCard") {
        console.log("error: only one card allowed");
        return;
      }

      const currentCardIndex = emblaApiCardsVote?.selectedScrollSnap() || 0;
      const currentCard = cardsOnTable[currentCardIndex];

      if (!currentCard) {
        console.log("error: card not found");
        return;
      }

      setCardsSet(prev => {
        const isSelected =
          prev.firstCard?._id === currentCard._id ||
          prev.secondCard?._id === currentCard._id;

        if (isSelected && prev[btnKey]?._id === currentCard._id)
          return { ...prev, [btnKey]: null };

        const otherCard =
          btnKey === "firstCard" ? prev.secondCard : prev.firstCard;

        if (!prev.firstCard || !prev.secondCard) {
          if (!playersMoreThanThree && otherCard?._id === currentCard._id) {
            console.log("error: cards must be different");
            return prev;
          }

          return { ...prev, [btnKey]: currentCard };
        }

        return prev; // Якщо обидва слоти зайняті іншими картами
      });
    },
    [emblaApiCardsVote, isSingleCardMode, cardsOnTable, playersMoreThanThree],
  );

  const exitCarouselMode = useCallback(() => {
    setIsCarouselModeTableScreen(false);
    setMiddleButton(null);
  }, [setIsCarouselModeTableScreen, setMiddleButton]);

  const handleVote = () => {
    console.log("handleVote");
  };

  // // Get active card's index
  useEffect(() => {
    if (!emblaApiCardsVote) return; // Перевірка на наявність API

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

  useEffect(() => {
    if (!isActiveScreen) return;

    if (isCarouselModeTableScreen) {
      // Якщо це режим каруселі, то можна вгадувати карти на столі:
      const activeCard = cardsOnTable[activeCardIdx];
      if (!activeCard) {
        console.log("error: card not found");
        return;
      }

      const isDisabledFirstBtn = playersMoreThanThree
        ? firstCard && firstCard._id !== activeCard._id
        : (firstCard && firstCard._id !== activeCard._id) ||
          (!firstCard && secondCard && secondCard._id === activeCard._id);

      const isDisabledSecondBtn = playersMoreThanThree
        ? secondCard && secondCard._id !== activeCard._id
        : (secondCard && secondCard._id !== activeCard._id) ||
          (!secondCard && firstCard && firstCard._id === activeCard._id);

      setMiddleButton(
        <>
          <Button btnText="Back" onClick={exitCarouselMode} />

          <div style={{ display: "flex", flexDirection: "row" }}>
            {!isCurrentPlayerStoryteller && (
              <>
                <Button
                  btnText="★1"
                  onClick={() => toggleCardSelection("firstCard")}
                  disabled={isDisabledFirstBtn || isCurrentPlayerVoted}
                  localClassName={cardsSet.firstCard && css.btnActive}
                />
                {!isSingleCardMode && (
                  <Button
                    btnText="★2"
                    onClick={() => toggleCardSelection("secondCard")}
                    disabled={isDisabledSecondBtn || isCurrentPlayerVoted}
                    localClassName={cardsSet.secondCard && css.btnActive}
                  />
                )}
              </>
            )}
          </div>
        </>,
      );
    } else {
      // Якщо це не карусель, то можна проголосувати, якщо вибір вже зроблений
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText={!storytellerId ? "Tell your story" : "Guess story"}
          onClick={handleVote}
          disabled={
            gameStatus === VOTING && (!isCanVote || isCurrentPlayerVoted)
          }
        />,
      );
    }

    // Якщо це ведучий:
    if (hostPlayerId === userCredentials._id && isReadyToVote) {
      // Якщо це не сторітеллер
      setMiddleButton(
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText={"Finish round"}
          onClick={calculateRoundPoints}
        />,
      );
    }

    if (
      !storytellerId ||
      isCurrentPlayerStoryteller ||
      !isCanVote ||
      isCurrentPlayerVoted
    )
      setMiddleButton(null);
  }, [
    activeCardIdx,
    calculateRoundPoints,
    cardsOnTable,
    cardsSet.firstCard,
    cardsSet.secondCard,
    exitCarouselMode,
    firstCard,
    gameStatus,
    hostPlayerId,
    isActiveScreen,
    isCanVote,
    isCarouselModeTableScreen,
    isCurrentPlayerStoryteller,
    isCurrentPlayerVoted,
    isReadyToVote,
    isSingleCardMode,
    playersMoreThanThree,
    secondCard,
    setMiddleButton,
    storytellerId,
    toggleCardSelection,
    userCredentials._id,
  ]);

  const carouselModeOn = idx => {
    setSelectedCardIdx(idx);
    setIsCarouselModeTableScreen(true);
    // setActiveCardIdx(idx);
  };

  // Set star(s) to card(s):
  const getStarMarks = cardId => {
    const marks = [];
    if (firstCard?._id === cardId) marks.push("★1");
    if (secondCard?._id === cardId) marks.push("★2");
    return marks;
  };

  return (
    <>
      <p>Table</p>

      {isReadyToVote ? (
        <>
          <div>cards face up</div>

          {isCarouselModeTableScreen ? (
            <div
              className={css.carouselWrapper}
              ref={emblaRefCardsVote}
              // ref={isCarouselModeHandScreen ? null : emblaRefCardsVote}
              //
            >
              <ul className={css.carouselContainer}>
                {cardsOnTable.map(card => (
                  <li className={css.carouselSlide} key={card._id}>
                    <img
                      src={card.url}
                      alt="card"
                      className={css.carouselImage}
                    />
                    <div className={css.checkboxContainer}>
                      {getStarMarks(card._id).map((mark, index) => (
                        <span key={index} className={css.checkboxCarousel}>
                          {mark}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <ul className={`${css.currentDeck}`}>
                {cardsOnTable.map((card, idx) => (
                  <li
                    className={css.card}
                    key={card._id}
                    onClick={() => carouselModeOn(idx)}>
                    <img className={css.img} src={card.url} alt="card" />
                    <div className={css.checkboxContainer}>
                      {getStarMarks(card._id).map((mark, index) => (
                        <span key={index} className={css.checkboxCard}>
                          {mark}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
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
