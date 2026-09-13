import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

import "./Login.css";

function Login() {
  const {
    user,
    loading,
    signInWithGoogle,
  } = useAuth();

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [signingIn, setSigningIn] =
    useState(false);

  if (loading) {
    return (
      <div className="login-loading">
        <div className="login-loading-spinner" />
        <p>載入中...</p>
      </div>
    );
  }

  if (user) {
    navigate("/");
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setSigningIn(true);

      await signInWithGoogle();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Google 登入失敗",
      );

      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      {/* 背景裝飾 */}
      <div className="login-bg-shape login-bg-shape-1" />
      <div className="login-bg-shape login-bg-shape-2" />

      <div className="login-container">
        {/* Logo */}
        <div className="login-brand">
          <div className="login-brand-icon">
            🧭
          </div>

          <h1>Journey Log</h1>

          <p>
            記錄每一段旅程，
            <br />
            收藏每一個值得回憶的瞬間。
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>歡迎回來</h2>

            <p>
              登入 Journey Log
              繼續你的旅程
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <span className="login-error-icon">
                ⚠️
              </span>

              <span>{error}</span>
            </div>
          )}

          {/* Google Login */}
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={signingIn}
          >
            {signingIn ? (
              <>
                <span className="login-spinner" />
                登入中...
              </>
            ) : (
              <>
                <span className="google-icon">
                  G
                </span>

                <span>
                  使用 Google 登入
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span />
            <span>安全登入</span>
            <span />
          </div>

          <p className="login-security">
            🔒 使用 Google 帳號安全登入
            <br />
            不需要另外設定密碼
          </p>
        </div>

        {/* Footer */}
        <div className="login-footer">
          Journey Log
          <span>·</span>
          Explore · Record · Remember
        </div>
      </div>
    </div>
  );
}

export default Login;