import { useDispatch } from "react-redux";
import { setActiveAction } from "features/game/gameSlice.js";

export const useOptimisticDispatch = () => {
  const dispatch = useDispatch();

  const customDispatch = action => {
    if (action.type === "game/performOptimisticUpdate") {
      const { eventName, updatedGame } = action.payload;
      const key = `${eventName}-${updatedGame._id}`;

      dispatch(setActiveAction({ key, value: { ...action, meta: {} } }));
    }

    dispatch(action);
  };

  return { customDispatch };
};
