import {
  NavLink,
  type NavLinkRenderProps,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

function Navbar() {
  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  // =========================
  // 登出
  // =========================
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("登出失敗:", error);
    }
  }

  // =========================
  // 導覽列連結樣式
  // =========================
  function getNavLinkClass({
    isActive,
  }: NavLinkRenderProps) {
    return `navbar-link ${isActive ? "active" : ""}`;
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* ========================================
            Logo / 品牌
            ======================================== */}

        <NavLink
          to="/"
          className="navbar-brand"
          aria-label="Journey Log 首頁"
        >
          <span className="navbar-brand-icon">
            🧭
          </span>

          <span className="navbar-brand-text">
            Journey Log
          </span>
        </NavLink>


        {/* ========================================
            導覽選單
            ======================================== */}

        <nav
          className="navbar-links"
          aria-label="主要導覽"
        >
          {/* 首頁 */}
          <NavLink
            to="/"
            className={getNavLinkClass}
          >
            <span aria-hidden="true">⌂</span>
            <span>首頁</span>
          </NavLink>


          {/* 密室逃脫 */}
          <NavLink
            to="/escape-rooms"
            className={getNavLinkClass}
          >
            <span aria-hidden="true">🔐</span>
            <span>密室逃脫</span>
          </NavLink>


          {/* 旅遊 */}
          <NavLink
            to="/travels"
            className={getNavLinkClass}
          >
            <span aria-hidden="true">✈️</span>
            <span>旅遊</span>
          </NavLink>


          {/* 管理員
              只有具有 admin 權限才顯示 */}
          {hasPermission("admin") && (
            <NavLink
              to="/admin"
              className={getNavLinkClass}
            >
              <span aria-hidden="true">⚙️</span>
              <span>管理員</span>
            </NavLink>
          )}
        </nav>


        {/* ========================================
            登入 / 登出
            ======================================== */}

        <div className="navbar-auth">

          {user ? (
            <>
              {/* 已登入狀態 */}
              <span className="navbar-user">
                <span
                  className="navbar-user-dot"
                  aria-hidden="true"
                />

                <span>已登入</span>
              </span>


              {/* 登出 */}
              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                登出
              </button>
            </>
          ) : (

            /* 尚未登入 */
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
