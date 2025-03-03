import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import clsx from "clsx";

import { selectUserIsLoggedIn } from "redux/selectors";

import css from "../navigation.module.scss";

export default function NavigationMenu() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return (
    <div className={css.navBar}>
      <NavLink
        to="/"
        className={({ isActive }) => clsx(css.link, isActive && css.active)}>
        Home
      </NavLink>

      {isLoggedIn && (
        <>
          <NavLink
            to="/game"
            className={({ isActive }) =>
              clsx(css.link, isActive && css.active)
            }>
            Game
          </NavLink>
        </>
      )}
    </div>
  );
}
