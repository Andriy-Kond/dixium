import { selectUserIsLoggedIn } from "app/selectors";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
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
          {/* <NavLink
            to="/contacts"
            className={({ isActive }) =>
              clsx(css.link, isActive && css.active)
            }>
            Contacts
          </NavLink> */}

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
