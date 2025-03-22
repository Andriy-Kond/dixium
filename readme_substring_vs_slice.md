```js
export const capitalizeWords = str =>
  str
    .split(" ")
    // .map(word => word[0].toUpperCase() + word.slice(1))
    .map(word => word[0].toUpperCase() + word.substring(1))
    .join(" ");

const capitalizeWordsByRegex = str =>
  str.replace(/\b\w/g, letter => letter.toUpperCase());

// Приклади
const str = "Hello World";

console.log(str.substring(0, 5)); // "Hello"
console.log(str.substring(6)); // "World"
console.log(str.substring(5, 2)); // "lo " (міняє 5 і 2 місцями, бо якщо startIndex > endIndex, вони автоматично міняються місцями.)

console.log(str.split(" ")); // ["Hello", "World"]
console.log(str.split("o")); // ["Hell", " W", "rld"]
console.log(str.split("")); // ["H", "e", "l", "l", "o", " ", "W", "o", "r", "l", "d"]
console.log(str.split(" ", 1)); // ["Hello"]
```
