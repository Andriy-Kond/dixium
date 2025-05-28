import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setComponentHeight,
  setIsHeightReady,
} from "redux/game/localPersonalSlice.js";
import { selectComponentHeight, selectIsHeightReady } from "redux/selectors.js";

export function useComponentHeight(ref) {
  console.log("useComponentHeight >> ref.current:::", ref.current);
  const dispatch = useDispatch();
  const debounceTimeout = useRef(null);
  const componentHeight = useSelector(selectComponentHeight);
  const isHeightReady = useSelector(selectIsHeightReady); // чи визначена висота компонента.

  useLayoutEffect(() => {
    dispatch(setIsHeightReady(false));
    if (componentHeight) dispatch(setIsHeightReady(true));
    const updateHeight = () => {
      // dispatch(setComponentHeight(ref.current.offsetHeight));
      const { height } = ref.current.getBoundingClientRect();
      dispatch(setComponentHeight(height));
      dispatch(setIsHeightReady(true));
    };

    // Синхронне встановлення висоти при монтуванні
    if (ref.current) {
      updateHeight();
      // dispatch(setComponentHeight(ref.current.offsetHeight));
      // // const { height } = ref.current.getBoundingClientRect();
      // // dispatch(setComponentHeight(height));
      // dispatch(setIsHeightReady(true));
    }

    const observer = new ResizeObserver(entries => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      try {
        debounceTimeout.current = setTimeout(() => {
          // for (let entry of entries) {
          //   // dispatch(setComponentHeight(entry.target.offsetHeight));
          //   // // const { height } = ref.current.getBoundingClientRect();
          //   // // dispatch(setComponentHeight(height));
          //   // dispatch(setIsHeightReady(true));
          // }
          updateHeight();
        }, 100); // Дебонсинг на 100 мс
      } catch (error) {
        console.error("ResizeObserver error:", error);
      }
    });

    if (ref.current) observer.observe(ref.current);

    const refCurr = ref.current;

    return () => {
      if (refCurr) observer.unobserve(refCurr);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [componentHeight, dispatch, ref]);
}

// export function useComponentHeight(refCurrent) {
//   if (refCurrent === null) {
//     console.log("refCurrent is null before mounting");
//   }

//   useEffect(() => {
//     console.log("useComponentHeight >> refCurrent :::", refCurrent);
//   }, [refCurrent]);

//   const dispatch = useDispatch();
//   const debounceTimeout = useRef(null);
//   const componentHeight = useSelector(selectComponentHeight);
//   const isHeightReady = useSelector(selectIsHeightReady); // чи визначена висота компонента.

//   useLayoutEffect(() => {
//     if (componentHeight) setIsHeightReady(true); // Висота готова, якщо є збережене значення

//     // Синхронне встановлення висоти при монтуванні
//     // const updateHeight = () => {
//     //   if (refCurrent) {
//     //     // const height = refCurrent.offsetHeight;
//     //     const { height } = refCurrent.getBoundingClientRect();
//     //     dispatch(setComponentHeight(height));
//     //     dispatch(setIsHeightReady(true)); // Позначити, що висота визначена
//     //   }
//     // };

//     // updateHeight();

//     if (refCurrent) {
//       // const { height } = refCurrent.getBoundingClientRect();
//       const height = refCurrent.offsetHeight;
//       dispatch(setComponentHeight(height));
//       dispatch(setIsHeightReady(true)); // Позначити, що висота визначена
//     }

//     const observer = new ResizeObserver(entries => {
//       console.log("mounted, observing componentRef");
//       if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

//       debounceTimeout.current = setTimeout(() => {
//         for (let entry of entries) {
//           // updateHeight();
//           const height = entry.target.offsetHeight;
//           dispatch(setComponentHeight(height));
//           dispatch(setIsHeightReady(true));
//         }
//       }, 100); // Дебонсинг на 100 мс
//     });

//     if (refCurrent) observer.observe(refCurrent);

//     return () => {
//       console.log("unmounting");
//       if (refCurrent) observer.unobserve(refCurrent);
//       if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
//     };
//   }, [componentHeight, dispatch, refCurrent]);

//   return isHeightReady;
// }

// import { useEffect, useRef } from "react";
// import { useDispatch } from "react-redux";
// import { setComponentHeight } from "redux/game/localPersonalSlice.js";

// export function useComponentHeight(ref) {
//   const dispatch = useDispatch();
//   const debounceTimeout = useRef(null);

//   useEffect(() => {
//     const observer = new ResizeObserver(entries => {
//       console.log("mounted, observing componentRef");
//       if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

//       debounceTimeout.current = setTimeout(() => {
//         for (let entry of entries)
//           dispatch(setComponentHeight(entry.target.offsetHeight));
//       }, 100); // Дебонсинг на 100 мс
//     });

//     if (refCurrent) observer.observe(refCurrent);

//     const refCurrent = refCurrent;
//     return () => {
//       console.log("unmounting");
//       if (refCurrent) observer.unobserve(refCurrent);

//       if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
//     };
//   }, [dispatch, ref]);
// }
