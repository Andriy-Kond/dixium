import { useSelector } from "react-redux";
import { selectUserIsLoggedIn, selectUserToken } from "app/selectors";

import NavigationMenu from "common/components/navComponents/NavigationMenu";
import AuthNav from "common/components/navComponents/AuthNav";
import UserMenu from "common/components/navComponents/UserMenu";

import css from "./AppBar.module.scss";

export default function AppBar() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const isUserToken = useSelector(selectUserToken);

  return (
    <nav className={css.navMenu}>
      <NavigationMenu />

      {/* перевірка щоб при перезавантаженні сторінки при наявному токені не блимало спочатку AuthNav, а потім UserMenu: */}
      {isUserToken && isLoggedIn && <UserMenu />}
      {!isUserToken && <AuthNav />}
    </nav>
  );
}
