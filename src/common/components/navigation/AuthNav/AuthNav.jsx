import css from "../Navigation.module.scss";
import clsx from "clsx";
import { NavLink } from "react-router-dom";

export default function AuthNav() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
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
