// export const myDebounce = (callback, delay) => {
//   let timerId;

//   return function (...args) {
//     clearTimeout(timerId);
//     timerId = setTimeout(() => {
//       callback.apply(this, args); // щоб зберегти контекст і передати аргументи.
//     }, delay);
//   };
// };

export function myDebounce(callback, delay) {
  let timerId = null;

  return function (...args) {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      callback(...args); // сучасний синтаксис замість apply
      timerId = null; // щоб уникнути витоків пам'яті
    }, delay);
  };
}
