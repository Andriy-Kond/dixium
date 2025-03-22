export const capitalizeWords = str =>
  str
    .split(" ")
    // .map(word => word[0].toUpperCase() + word.slice(1))
    .map(word => word[0].toUpperCase() + word.substring(1))
    .join(" ");

const capitalizeWordsByRegex = str =>
  str.replace(/\b\w/g, letter => letter.toUpperCase());
