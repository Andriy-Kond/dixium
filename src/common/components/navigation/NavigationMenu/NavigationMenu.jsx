import { selectUserIsLoggedIn } from "app/selectors";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import css from "../navigation.module.scss";

export default function NavigationMenu() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <NavLink
          to="/"
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          Home
        </NavLink>

        {isLoggedIn && (
          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              clsx(css.link, isActive && css.active)
            }>
            Contacts
          </NavLink>
        )}
      </div>
    </>
  );
}
