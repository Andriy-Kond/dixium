import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { useGetAllDecksQuery } from "redux/game/gameApi.js";
import {
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";
import ImgGen from "common/components/ui/ImgGen/index.js";

import css from "./DeckCards.module.scss";

export default function DeckCards() {
  const dispatch = useDispatch();
  // Інший варіант передачі колоди:
  // const { state } = useLocation();
  // console.log(" DeckCards >> deckCards:::", state.deckCards);

  const { deckId } = useParams();
  const { data: allDecks, isLoading } = useGetAllDecksQuery();

  const deck = allDecks?.find(deck => deck._id === deckId);
  //# Page header color and text
  useEffect(() => {
    const headerTitleText = deck?.name;
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderTextSecond(""));
  }, [deck?.name, dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!deck) return <div>Deck not found</div>;

  return (
    <>
      {/* <h1>Deck Cards</h1> */}
      <ul className={css.currentDeckContainer}>
        {deck.cards?.map(card => (
          <li className={css.card} key={card._id}>
            <ImgGen className={css.img} publicId={card.public_id} />
          </li>
        ))}
      </ul>
    </>
  );
}
