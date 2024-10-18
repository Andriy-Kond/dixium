import { selectUserIsLoggedIn } from "app/selectors";
import { useSelector } from "react-redux";
import { StyledNavLink } from "../Navigation.styled";

export default function NavigationMenu() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <StyledNavLink to="/">Home</StyledNavLink>

        {isLoggedIn && <StyledNavLink to="/contacts">Contacts</StyledNavLink>}
      </div>
    </>
  );
}
