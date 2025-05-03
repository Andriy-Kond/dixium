import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

const BackButtonContext = createContext();

export function BackButtonProvider({ children }) {
  const [backButtonConfig, setBackButtonConfig] = useState({
    isVisible: false,
    onClick: null,
    label: "back", // За замовчуванням, можна змінювати через i18next
    priority: 0, // пріоритет, якщо кнопка використовується одночасно в кількох компонентах. Наприклад, у Hand і відкритій в ньому каруселі
  });

  const currentPriority = useRef(0);

  const showBackButton = useCallback(
    (onClick, label = "back", priority = 0) => {
      console.log(
        `showBackButton called with priority ${priority}, label ${label}`,
      );
      // setBackButtonConfig({ isVisible: true, onClick, label, priority });
      // currentPriority.current = priority;
      if (priority >= currentPriority.current) {
        setBackButtonConfig({ isVisible: true, onClick, label, priority });
        currentPriority.current = priority;
      }
    },
    [],
  );

  const hideBackButton = useCallback((priority = 0) => {
    // currentPriority.current = 0;
    if (priority >= currentPriority.current) {
      setBackButtonConfig({
        isVisible: false,
        onClick: null,
        label: "back",
        priority: 0,
      });

      currentPriority.current = 0;
    }
  }, []);

  return (
    <BackButtonContext.Provider
      value={{ showBackButton, hideBackButton, backButtonConfig }}>
      {children}
    </BackButtonContext.Provider>
  );
}

export const useBackButton = () => useContext(BackButtonContext);
