import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// import Backend from "i18next-http-backend"; // Для завантаження перекладів із файлів

import enTranslation from "locales/en/translation.json";
import ukTranslation from "locales/uk/translation.json";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "uk"],
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: enTranslation },
    uk: { translation: ukTranslation },
  },
});

// // Об'єкти з перекладами
// const resources = {
//   en: {
//     translation: {
//       welcome: "Welcome",
//       button_save: "Save",
//       error_message: "Something went wrong",
//       deck: "Deck",
//       logout: "Logout",
//     },
//   },
//   uk: {
//     translation: {
//       welcome: "Ласкаво просимо",
//       button_save: "Зберегти",
//       error_message: "Щось пішло не так",
//       deck: "Колода",
//       logout: "Вихід",
//     },
//   },
// };

// i18n
//   .use(initReactI18next) // Підключення до React
//   .init({
//     resources,
//     lng: "en", // Мова за замовчуванням
//     fallbackLng: "en", // Мова на випадок, якщо переклад відсутній
//     interpolation: {
//       escapeValue: false, // React уже захищає від XSS
//     },
//   });

// i18n
//   .use(Backend)
//   .use(initReactI18next) // Підключення до React
//   .init({
//     lng: "en", // Мова за замовчуванням
//     fallbackLng: "en", // Мова на випадок, якщо переклад відсутній
//     supportedLngs: ["en", "uk"],
//     interpolation: {
//       escapeValue: false, // React уже екранує (захищає від XSS)
//     },
//     backend: {
//       loadPath: "/locales/{{lng}}/translation.json",
//     },
//   });

export default i18n;
