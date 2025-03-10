import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Button from "common/components/ui/Button/index.js";
import css from "./CardCarousel.module.scss";

export default function CardCarousel({
  playerHand,
  setMiddleButton,
  onVote,
  onExit,
}) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [emblaRefCards, emblaApiCards] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const toggleCardSelection = starIndex => {
    const currentCardIndex = emblaApiCards?.selectedScrollSnap();
    const currentCard = playerHand[currentCardIndex];
    if (!currentCard) return;

    setSelectedCards(prev => {
      const isSelected = prev.some(card => card._id === currentCard._id);
      if (isSelected) {
        return prev.filter(card => card._id !== currentCard._id);
      } else if (prev.length < 2) {
        return [...prev, currentCard];
      }
      return prev;
    });
  };

  useEffect(() => {
    const currentCardIndex = emblaApiCards?.selectedScrollSnap() || 0;
    const currentCard = playerHand[currentCardIndex];
    const isFirstStarSelected = selectedCards[0]?._id === currentCard?._id;
    const isSecondStarSelected = selectedCards[1]?._id === currentCard?._id;

    setMiddleButton(
      <div className={css.carouselButtons}>
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText="★"
          onClick={() => toggleCardSelection(0)}
          disabled={selectedCards.length === 2 && !isFirstStarSelected}
        />
        <Button
          btnStyle={["btnFlexGrow"]}
          btnText="★"
          onClick={() => toggleCardSelection(1)}
          disabled={selectedCards.length === 2 && !isSecondStarSelected}
        />
        <Button btnStyle={["btnFlexGrow"]} btnText="Back" onClick={onExit} />
        {selectedCards.length === 2 && (
          <Button
            btnStyle={["btnFlexGrow"]}
            btnText="Vote"
            onClick={() => onVote(selectedCards)}
          />
        )}
      </div>,
    );
  }, [
    selectedCards,
    emblaApiCards,
    playerHand,
    setMiddleButton,
    onVote,
    onExit,
  ]);

  return (
    <div className={css.carouselWrapper} ref={emblaRefCards}>
      <div className={css.carouselContainer}>
        {playerHand.map(card => (
          <div className={css.carouselSlide} key={card._id}>
            <img src={card.url} alt="card" className={css.carouselImage} />
            {selectedCards.some(sc => sc._id === card._id) && (
              <span className={css.checkbox}>★</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
