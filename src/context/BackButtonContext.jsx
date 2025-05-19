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
    ({ onClick, priority = 0, label = "back" }) => {
      // console.log("Виклик showBackButton", {
      //   priority,
      //   currentPriority: currentPriority.current,
      // });

      // setBackButtonConfig({ isVisible: true, onClick, label, priority });
      // currentPriority.current = priority;
      if (priority >= currentPriority.current) {
        setBackButtonConfig({ isVisible: true, onClick, priority, label });
        currentPriority.current = priority;
        // console.log("Оновлено backButtonConfig", {
        //   isVisible: true,
        //   label,
        //   priority,
        // });
      } else {
        // console.log("Пріоритет нижчий, стан не оновлено");
      }
    },
    [],
  );

  const hideBackButton = useCallback(({ priority = 0 }) => {
    // console.log("Виклик hideBackButton", {
    //   priority,
    //   currentPriority: currentPriority.current,
    // });
    // currentPriority.current = 0;
    if (priority >= currentPriority.current) {
      setBackButtonConfig({
        isVisible: false,
        onClick: null,
        label: "back",
        priority: 0,
      });

      currentPriority.current = 0;
      // console.log("Оновлено backButtonConfig", {
      //   isVisible: false,
      //   priority: 0,
      // });
    } else {
      // console.log("Пріоритет нижчий, стан не оновлено");
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
