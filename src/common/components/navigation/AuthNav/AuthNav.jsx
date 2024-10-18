import css from "../Navigation.module.scss";
import clsx from "clsx";
import { StyledNavLink } from "../Navigation.styled";

export default function AuthNav() {
  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <StyledNavLink
          to="/register"
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          Register
        </StyledNavLink>
        <StyledNavLink
          to="/login"
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          Login
        </StyledNavLink>
      </div>
    </>
  );
}
