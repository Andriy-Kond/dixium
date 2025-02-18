import { NavLink } from "react-router-dom";
import clsx from "clsx";
import css from "common/components/navComponents/navigation.module.scss";

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
