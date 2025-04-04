import { useEffect, useState } from "react";
import css from "./Menu.module.scss";

export default function Menu() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 320);
      setIsTablet(width > 320 && width <= 768);
      setIsDesktop(width >= 1200);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const menuClass = isMobile
    ? `mobile-menu ${isOpen ? "open" : ""}`
    : isTablet
    ? "tablet-menu"
    : isDesktop
    ? "desktop-menu"
    : "tablet-menu"; // За замовчуванням для проміжних розмірів

  return (
    <nav>
      {isMobile && (
        <button className="burger-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
      )}
      <ul className={menuClass}>
        <li>
          <a href="#">Головна</a>
        </li>
        <li>
          <a href="#">Про нас</a>
        </li>
        <li>
          <a href="#">Контакти</a>
        </li>
      </ul>
    </nav>
  );
}
