// Підключаю lodash.debounce
// const throttle = require('lodash.throttle'); // перший варіант підключення
// const _ = require('lodash'); // другий варіант підключення - всю бібліотеку разом

// ~ Власний throttle для слухача window-scroll (lodash глючить)
export function myThrottle(callback, delay) {
  let timerId = null;

  return function perform(...args) {
    if (timerId) return;
    timerId = setTimeout(() => {
      callback(...args);
      clearTimeout(timerId);
      timerId = null;
    }, delay);
  };
}

// Роблю власний throttle, бо lodash дико глючить:
// const THROTTLE_DELAY = 500;
// const throttledScrollListener = myThrottle(scrollListener, THROTTLE_DELAY);
