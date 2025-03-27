import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Об'єкти з перекладами
const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      button_save: "Save",
      error_message: "Something went wrong",
      deck: "Deck",
      logout: "Logout",
    },
  },
  uk: {
    translation: {
      welcome: "Ласкаво просимо",
      button_save: "Зберегти",
      error_message: "Щось пішло не так",
      deck: "Колода",
      logout: "Вихід",
    },
  },
};

i18n
  .use(initReactI18next) // Підключення до React
  .init({
    resources,
    lng: "en", // Мова за замовчуванням
    fallbackLng: "en", // Мова на випадок, якщо переклад відсутній
    interpolation: {
      escapeValue: false, // React уже захищає від XSS
    },
  });

export default i18n;
