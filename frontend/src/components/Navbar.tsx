import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

function Navbar() {
  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("登出失敗:", error);
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo / 品牌 */}
        <NavLink
          to="/"
          className="navbar-brand"
        >
          <span className="navbar-brand-icon">
            🧭
          </span>

          <span className="navbar-brand-text">
            Journey Log
          </span>
        </NavLink>

        {/* 導覽選單 */}
        <nav className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>⌂</span>
            首頁
          </NavLink>

          <NavLink
            to="/escape-rooms"
            className={({ isActive }) =>
              `navbar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>🔐</span>
            密室逃脫
          </NavLink>

          <NavLink
            to="/travels"
            className={({ isActive }) =>
              `navbar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>✈️</span>
            旅遊
          </NavLink>

          {/* 只有 admin 才顯示管理員選單 */}
          {hasPermission("admin") && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `navbar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>⚙️</span>
              管理員
            </NavLink>
          )}
        </nav>

        {/* 登入 / 登出 */}
        <div className="navbar-auth">
          {user ? (
            <>
              <span className="navbar-user">
                <span className="navbar-user-dot" />
                已登入
              </span>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                登出
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="navbar-login"
            >
              登入
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
