import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserIsLoggedIn } from "redux/selectors/selectorsAuthSlice.js";

export default function PrivateRoute({ redirectTo = "/login" }) {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return isLoggedIn ? <Outlet /> : <Navigate to={redirectTo} />;
}
