import React, { useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

const EmblaContainer = styled.div`
  overflow: hidden;
`;

const EmblaViewport = styled.div`
  display: flex;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  position: relative;
`;

const NestedEmbla = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 80%;
  border: 2px solid #fff;
`;

const ParentCarousel = () => {
  const [emblaRef] = useEmblaCarousel();

  return (
    <EmblaContainer ref={emblaRef}>
      <EmblaViewport>
        {[...Array(3)].map((_, index) => (
          <Slide key={index}>
            <h3>Слайд {index + 1}</h3>
            {index === 1 && <ChildCarousel />}
          </Slide>
        ))}
      </EmblaViewport>
    </EmblaContainer>
  );
};

const ChildCarousel = () => {
  const [emblaRef] = useEmblaCarousel();

  const stopPropagation = useCallback(event => {
    event.stopPropagation();
  }, []);

  return (
    <NestedEmbla ref={emblaRef} onPointerDown={stopPropagation}>
      <EmblaViewport>
        {[...Array(3)].map((_, index) => (
          <Slide key={index}>
            <h4>Вкладений {index + 1}</h4>
          </Slide>
        ))}
      </EmblaViewport>
    </NestedEmbla>
  );
};

export default ParentCarousel;
