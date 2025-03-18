import { useCallback } from "react";
import { useDispatch } from "react-redux";

export const useOptimisticDispatch = () => {
  const dispatch = useDispatch();

  // Якщо не стабілізувати через useCallback, то буде цикл при виклику у useVote (useCallback кешує optimisticUpdateDispatch, щоб вона не створювалася заново при кожному рендері.)
  const optimisticUpdateDispatch = useCallback(
    payload => {
      const action = {
        type: "game/performOptimisticUpdate",
        payload,
      };

      action.payload.timeout = payload.timeout || 2000;

      dispatch(action);
    },
    [dispatch],
  );

  return { optimisticUpdateDispatch };
};
