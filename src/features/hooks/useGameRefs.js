import { useRef } from "react";

export const useGameRefs = () => {
  const prevRunGameStateRef = useRef(null);
  const timeoutRunGameRef = useRef(null);
  const prevDnDGameStateRef = useRef(null);
  const timeoutDnDRef = useRef(null);

  return {
    prevRunGameStateRef,
    timeoutRunGameRef,
    prevDnDGameStateRef,
    timeoutDnDRef,
  };
};
