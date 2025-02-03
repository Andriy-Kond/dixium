import css from "../navigation.module.scss";
import clsx from "clsx";
import { NavLink } from "react-router-dom";

export default function AuthNav() {
  return (
    <div className={css.navBar}>
      <NavLink
        to="/register"
        className={({ isActive }) => clsx(css.link, isActive && css.active)}>
        Register
      </NavLink>

      <NavLink
        to="/login"
        className={({ isActive }) => clsx(css.link, isActive && css.active)}>
        Login
      </NavLink>
    </div>
  );
}

// className={({ isActive }) => `${css.link} ${isActive ? css.active : ""}`.trim()}>
// the same:
// className={({ isActive }) => clsx(css.link, isActive && css.active)}>
