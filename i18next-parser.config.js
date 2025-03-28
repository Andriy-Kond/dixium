import { capitalizeWords } from "./src/utils/game/capitalizeWords.js";

const i18next_parser = {
  input: ["src/**/*.{js,jsx,ts,tsx}"],
  output: "src/locales/$LOCALE/translation.json",
  locales: ["en", "uk"],
  defaultValue: (lng, ns, key) => (lng === "en" ? capitalizeWords(key) : ""), // ля "en" — ключ, для "uk" — порожньо
};

export default i18next_parser;

// module.exports = {
//   input: ["src/**/*.{js,jsx,ts,tsx}"],
//   output: "src/locales/$LOCALE/translation.json",
//   locales: ["en", "uk"],
//   // defaultValue: "{{key}}", // Якщо переклад відсутній
//   defaultValue: (lng, ns, key) => (lng === "en" ? capitalizeWords(key) : ""), // Для "en" — ключ, для "uk" — порожньо
// };

// module.exports = {
//   input: ["src/**/*.{js,jsx,ts,tsx}"],
//   output: "src/locales/$LOCALE/$NAMESPACE.json",
//   locales: ["en", "uk"],
//   defaultValue: "__STRING_NOT_TRANSLATED__",
//   keepRemoved: false,
// };
