import { selectUserIsLoggedIn } from "app/selectors";

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ redirectTo = "/login" }) {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return isLoggedIn ? <Outlet /> : <Navigate to={redirectTo} />;
}
