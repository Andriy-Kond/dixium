import { selectUserIsLoggedIn } from "app/selectors";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import css from "../Navigation.module.scss";
import clsx from "clsx";
import { StyledNavLink } from "../Navigation.styled";

// const style = ({ isActive, isPending, isTransitioning }) => {
//   return {
//     fontWeight: isActive ? "bold" : "",
//     color: isActive ? "#ff4500" : "#000",
//     viewTransitionName: isTransitioning ? "slide" : "",

//     padding: "8px 16px",
//     borderRadius: "4px",
//     textDecoration: "none",
//     fontSize: "26px",
//     transition: "transform 1.3s ease",
//   };
// };

// const StyledNavLink = styled(NavLink)`
// font-weight: normal;
// color: #000;
// transition: transform 0.3s ease;

// &.active {
//   font-weight: bold;
//   color: #ff4500;
// }

// &.pending {
//   color: red;
// }

// &.transitioning {
//   transform: scale(1.05);
// }
// `;

export default function NavigationMenu() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <StyledNavLink to="/">Home</StyledNavLink>

        {isLoggedIn && <StyledNavLink to="/contacts">Contacts</StyledNavLink>}

        {/* <NavLink to="/" style={style}>
          Home
        </NavLink>
        {isLoggedIn && (
          <NavLink to="/contacts" style={style}>
            Contacts
          </NavLink>
        )} */}
      </div>
    </>
  );
}
