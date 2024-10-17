import { selectUserIsLoggedIn } from "app/selectors";

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute({ redirectTo = "/contacts" }) {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return isLoggedIn ? <Navigate to={redirectTo} /> : <Outlet />;
}
