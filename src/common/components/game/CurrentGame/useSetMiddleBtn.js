// import clsx from "clsx";
// import useEmblaCarousel from "embla-carousel-react";
// import { useGuess } from "hooks/useGuess.js";
// import { useStartNewRound } from "hooks/useStartNewRound.js";
// import { useTellStory } from "hooks/useTellStory.js";
// import { Notify } from "notiflix";
// import { useCallback } from "react";
// import { useTranslation } from "react-i18next";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import {
//   selectCardsSet,
//   selectIsCarouselModeHandScreen,
//   selectIsShowMask,
//   selectLocalGame,
//   selectSelectedCardId,
//   selectUserCredentials,
// } from "redux/selectors.js";

// import {
//   LOBBY,
//   GUESSING,
//   VOTING,
//   ROUND_RESULTS,
//   FINISH,
// } from "utils/generals/constants.js";

// import css from "./CurrentGame.module.scss";
// import {
//   removeSelectedCardId,
//   setCardsSet,
//   setIsCarouselModeHandScreen,
//   setIsShowMask,
//   setSelectedCardId,
// } from "redux/game/localPersonalSlice.js";
// import socket from "services/socket.js";

// export function useSetMiddleBtn({
//   setMiddleButton,
//   screen,
//   startVoting,
//   finishRound,
//   selectedCardIdx,
//   activeCardIdx,
// }) {
//   //* setMiddleButton
//   const dispatch = useDispatch();
//   const { t } = useTranslation();
//   const { gameId } = useParams();

//   const userCredentials = useSelector(selectUserCredentials);
//   const { _id: playerId } = userCredentials;
//   const currentGame = useSelector(selectLocalGame(gameId));
//   const isShowMask = useSelector(selectIsShowMask(gameId, playerId));

//   const isCarouselModeHandScreen = useSelector(
//     selectIsCarouselModeHandScreen(gameId, playerId),
//   );

//   const cardsSet = useSelector(selectCardsSet(gameId, playerId));
//   const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));
//   const { firstGuessCardSet, secondGuessCardSet } = cardsSet;

//   // const [selectedCardIdx, setSelectedCardIdx] = useState(0); // for open current clicked card
//   // const [activeCardIdx, setActiveCardIdx] = useState(0); // idx of active card

//   const tellStory = useTellStory(gameId);
//   const guessStory = useGuess(gameId, cardsSet);
//   const startNewRound = useStartNewRound(gameId);

//   const [emblaRefCardsGuess, emblaApiCardsGuess] = useEmblaCarousel({
//     loop: true,
//     align: "center",
//     startIndex: selectedCardIdx,
//     watchDrag: isCarouselModeHandScreen,
//   });

//   const returnToHand = useCallback(() => {
//     // console.log("returnToHand");
//     const updatedGame = { ...currentGame, isFirstTurn: false };
//     dispatch(setIsShowMask({ gameId, playerId, isShow: false }));

//     socket.emit("gameUpdateFirstTurn", { updatedGame }, response => {
//       if (response?.error) {
//         console.error("Failed to update game:", response.error);
//       }
//     });

//     dispatch(removeSelectedCardId({ gameId, playerId })); // clear
//   }, [currentGame, dispatch, gameId, playerId]);

//   if (!currentGame) return;

//   const { gameStatus, storytellerId, players, hostPlayerId } = currentGame;
//   const currentPlayer = players.find(p => p._id === playerId);
//   const isCurrentPlayerHost = hostPlayerId === playerId;
//   const isCurrentPlayerGuessed = players.some(
//     p => p._id === playerId && p.isGuessed,
//   );
//   const isPlayersMoreThanThree = players.length > 3;
//   const isCurrentPlayerStoryteller = storytellerId === playerId;
//   const storyteller = players.find(p => p._id === storytellerId);

//   if (isCarouselModeHandScreen) {
//     // console.log("Carousel Mode");
//     const activeCard = currentPlayer?.hand[activeCardIdx];
//     if (!activeCard) {
//       // console.log("error: card not found");
//       Notify.failure(t("err_card_not_found"));
//       return;
//     }

//     const isCanGuess = () => {
//       if (!isPlayersMoreThanThree) {
//         return !!firstGuessCardSet?._id && !!secondGuessCardSet?._id;
//       } else {
//         return !!firstGuessCardSet?._id;
//       }
//     };

//     const toggleCardSelection = btnKey => {
//       // console.log("toggleCardSelection");
//       if (!currentGame) return;

//       const { isSingleCardMode, players, gameStatus } = currentGame;
//       const isPlayersMoreThanThree = players.length > 3;

//       if (isSingleCardMode && btnKey === "secondGuessCardSet") {
//         // console.log("error: only one card allowed");
//         Notify.failure(t("err_only_one_card_allowed"));
//         return;
//       }

//       const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
//       const currentPlayer = players.find(p => p._id === playerId);
//       const currentCard = currentPlayer?.hand[currentCardIndex];
//       if (!currentCard) {
//         // console.log("error: card not found");
//         Notify.failure(t("err_card_not_found"));
//         return;
//       }

//       if (gameStatus === GUESSING) {
//         // console.log("gameStatus === GUESSING");
//         // Встановлення локального стану карток:
//         const isSelected =
//           firstGuessCardSet?._id === currentCard._id ||
//           secondGuessCardSet?._id === currentCard._id;

//         if (isSelected && cardsSet[btnKey]?._id === currentCard._id) {
//           dispatch(
//             setCardsSet({
//               gameId,
//               playerId,
//               cardsSet: { ...cardsSet, [btnKey]: null },
//             }),
//           );

//           return;
//         }

//         const otherCard =
//           btnKey === "firstGuessCardSet"
//             ? secondGuessCardSet
//             : firstGuessCardSet;

//         // Якщо картки не обрані
//         if (!firstGuessCardSet || !secondGuessCardSet) {
//           // Коли гравців троє, то в комірках мають бути різні карти:
//           if (!isPlayersMoreThanThree && otherCard?._id === currentCard._id) {
//             Notify.failure(t("err_cards_must_be_different"));
//             // console.log("error: cards must be different");
//           } else {
//             dispatch(
//               setCardsSet({
//                 gameId,
//                 playerId,
//                 cardsSet: { ...cardsSet, [btnKey]: currentCard },
//               }),
//             );
//           }
//         }
//       } else if (gameStatus === LOBBY) {
//         // console.log("gameStatus === LOBBY");
//         if (currentCard._id === selectedCardId) {
//           // console.log("removeSelectedCardId");
//           dispatch(removeSelectedCardId({ gameId, playerId })); // clear
//         } else {
//           // console.log("setSelectedCardId");
//           dispatch(
//             setSelectedCardId({
//               gameId,
//               playerId,
//               selectedCardId: currentCard._id,
//             }),
//           );
//         }
//       }
//     };

//     const handleStory = () => {
//       // console.log("handleStory");
//       if (!currentGame) return;

//       const { players, gameStatus } = currentGame;
//       const isPlayersMoreThanThree = players.length > 3;
//       const { firstGuessCardSet, secondGuessCardSet } = cardsSet;

//       if (isPlayersMoreThanThree && !firstGuessCardSet) {
//         console.warn("Оберіть карту для голосування!");
//         Notify.failure("Оберіть карту для голосування!");
//         return;
//       }

//       if (!isPlayersMoreThanThree && !firstGuessCardSet && !secondGuessCardSet) {
//         console.warn("Оберіть дві карти для голосування!");
//         Notify.failure("Оберіть дві карти для голосування!");
//         return;
//       }

//       if (
//         !isPlayersMoreThanThree &&
//         ((!firstGuessCardSet && secondGuessCardSet) ||
//           (firstGuessCardSet && !secondGuessCardSet))
//       ) {
//         console.warn("Залишилась обрати ще одну карту");
//         Notify.failure("Залишилась обрати ще одну карту");
//         return;
//       }

//       gameStatus === GUESSING ? guessStory() : tellStory();

//       const emptyCardsSet = {
//         firstGuessCardSet: null,
//         secondGuessCardSet: null,
//       };
//       dispatch(setCardsSet({ gameId, playerId, cardsSet: emptyCardsSet })); // не обов'язково

//       // закриваю карусель
//       dispatch(
//         setIsCarouselModeHandScreen({
//           gameId,
//           playerId,
//           isCarouselModeHandScreen: false,
//         }),
//       );

//       dispatch(removeSelectedCardId({ gameId, playerId })); // clear
//     };

//     const handleBtn = btnKey => {
//       if (!currentGame) return;

//       const { players, storytellerId, gameStatus } = currentGame;
//       const isCurrentPlayerStoryteller = storytellerId === playerId;
//       const currentPlayer = players.find(p => p._id === playerId);
//       const { isGuessed, isVoted } = currentPlayer;
//       const storyteller = players.find(p => p._id === storytellerId);

//       if (
//         (gameStatus === GUESSING && !isGuessed) ||
//         (gameStatus === VOTING && !isVoted) ||
//         (gameStatus === LOBBY && isCurrentPlayerStoryteller && !isVoted) ||
//         (gameStatus === LOBBY && !storyteller)
//       ) {
//         console.log("toggleCardSelection", btnKey);
//         toggleCardSelection(btnKey);

//         setTimeout(() => {
//           handleStory();
//         }, 300);
//       }
//     };

//     const isDisabledFirstBtn = () => {
//       const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
//       const currentCard = currentPlayer?.hand[currentCardIndex];

//       if (!currentCard) {
//         // console.log("error: card not found");
//         Notify.failure(t("err_card_not_found"));
//         return;
//       }

//       if (gameStatus === LOBBY)
//         return selectedCardId && selectedCardId !== currentCard._id;

//       if (gameStatus === GUESSING) {
//         if (isPlayersMoreThanThree)
//           return firstGuessCardSet && firstGuessCardSet._id !== activeCard._id;
//         else
//           return (
//             (firstGuessCardSet && firstGuessCardSet._id !== activeCard._id) ||
//             (!firstGuessCardSet &&
//               secondGuessCardSet &&
//               secondGuessCardSet._id === activeCard._id)
//           );
//       }
//     };

//     const isDisabledSecondBtn = () => {
//       return isPlayersMoreThanThree
//         ? secondGuessCardSet && secondGuessCardSet._id !== activeCard._id
//         : (secondGuessCardSet && secondGuessCardSet._id !== activeCard._id) ||
//             (!secondGuessCardSet &&
//               firstGuessCardSet &&
//               firstGuessCardSet._id === activeCard._id);
//     };

//     if (isCurrentPlayerGuessed) setMiddleButton(null);

//     if (!isCurrentPlayerGuessed) {
//       const currentCardIndex = emblaApiCardsGuess?.selectedScrollSnap() || 0;
//       const currentCard = currentPlayer.hand[currentCardIndex];

//       if (
//         !storytellerId ||
//         (!isCurrentPlayerStoryteller && storyteller?.isGuessed)
//       ) {
//         const btnText =
//           gameStatus === LOBBY ? t("select_this_card") : t("choose_card");
//         setMiddleButton(
//           <>
//             <button
//               className={clsx(
//                 css.btn,
//                 (firstGuessCardSet || selectedCardId) &&
//                   currentCard?._id === firstGuessCardSet?._id &&
//                   css.btnActive,
//               )}
//               onClick={() => handleBtn("firstGuessCardSet")}
//               disabled={isDisabledFirstBtn() || isCurrentPlayerGuessed}
//               // disabled={
//               //   isDisabledFirstBtn() ||
//               //   isCurrentPlayerGuessed ||
//               //   (!selectedCardId && !isCanGuess()) // todo перевірити цю умову disabled для інших станів
//               // }
//             >
//               {btnText}
//             </button>

//             {!isPlayersMoreThanThree &&
//               (gameStatus === LOBBY ? (
//                 ""
//               ) : (
//                 <button
//                   className={clsx(css.btn, secondGuessCardSet && css.btnActive)}
//                   onClick={() => handleBtn("secondGuessCardSet")}
//                   disabled={isDisabledSecondBtn() || isCurrentPlayerGuessed}
//                   // disabled={
//                   //   isDisabledSecondBtn() || isCurrentPlayerGuessed
//                   // }
//                 >
//                   {t("choose_card")}
//                 </button>
//               ))}
//           </>,
//         );
//       } else if (isCurrentPlayerStoryteller && !currentPlayer?.isGuessed) {
//         setMiddleButton(
//           <>
//             <button
//               className={clsx(
//                 css.btn,
//                 (firstGuessCardSet || selectedCardId) &&
//                   currentCard?._id === firstGuessCardSet?._id &&
//                   css.btnActive,
//               )}
//               // onClick={() => toggleCardSelection("firstGuessCardSet")}
//               onClick={handleStory}
//               disabled={isCurrentPlayerGuessed}
//               // disabled={
//               //   isDisabledFirstBtn() ||
//               //   isCurrentPlayerGuessed ||
//               //   (!selectedCardId && !isCanGuess())
//               // }
//             >
//               {t("select_this_card")}
//             </button>
//           </>,
//         );
//       }
//     }
//   }

//   const isReadyToVote = !players.some(player => !player.isGuessed);
//   const isReadyToCalculatePoints = players.every(player => player.isVoted);
//   if (!isCarouselModeHandScreen) {
//     // console.log("Non Carousel Mode");
//     setMiddleButton(null); // обнуляю кнопку для усіх при старті нового раунду

//     if (isShowMask) {
//       // console.log("isShowMask");
//       if (isCurrentPlayerStoryteller) {
//         // console.log("returnToHand() for isCurrentPlayerStoryteller ");
//         returnToHand(); // для оповідача екран-маска автоматично закривається
//       } else {
//         // console.log("set Mask for other players");
//         // Для інших гравців показується екран-маска, та кнопка закриття маски:
//         setMiddleButton(
//           <button className={css.btn} onClick={returnToHand}>
//             {t("go_to_guess_story")}
//           </button>,
//         );
//       }
//     }

//     if (!isShowMask) {
//       if (isCurrentPlayerHost) {
//         if (gameStatus === GUESSING && isReadyToVote) {
//           const isStartVotingDisabled = players.some(
//             player => !player.isGuessed,
//           );
//           // console.log("це хост і всі обрали карти - готові до голосування");
//           setMiddleButton(
//             <button
//               className={css.btn}
//               onClick={startVoting}
//               disabled={isStartVotingDisabled}>
//               {t("start_voting")}
//             </button>,
//           );
//         }

//         if (gameStatus === VOTING && isReadyToCalculatePoints) {
//           // console.log("це хост і всі проголосували - можна рахувати бали");
//           setMiddleButton(
//             <button className={css.btn} onClick={finishRound}>
//               {t("finish_round")}
//             </button>,
//           );
//         }

//         if (gameStatus === ROUND_RESULTS) {
//           setMiddleButton(
//             <button
//               className={css.btn}
//               onClick={startNewRound}
//               disabled={gameStatus === FINISH}>
//               {t("start_new_round")}
//             </button>,
//           );
//         }
//       } else setMiddleButton(null);
//     }
//   }
// }
