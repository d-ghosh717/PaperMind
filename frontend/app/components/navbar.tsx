import { Link, NavLink } from "react-router";
import { Sparkles } from "lucide-react";
import styles from "./navbar.module.css";
import classNames from "classnames";

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Sparkles className={styles.logoIcon} />
          <span>PaperMind</span>
        </Link>
        <div className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => classNames(styles.navLink, { [styles.active]: isActive })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => classNames(styles.navLink, { [styles.active]: isActive })}
          >
            History
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
