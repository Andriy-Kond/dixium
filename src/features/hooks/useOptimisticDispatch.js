import { useDispatch } from "react-redux";

export const useOptimisticDispatch = () => {
  const dispatch = useDispatch();

  const optimisticUpdateDispatch = payload => {
    const action = {
      type: "game/performOptimisticUpdate",
      payload,
    };

    action.payload.timeout = payload.timeout || 2000;

    dispatch(action);
  };

  return { optimisticUpdateDispatch };
};
