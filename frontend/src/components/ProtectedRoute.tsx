import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import Unauthorized from "./Unauthorized";

interface ProtectedRouteProps {
  permission: string;
  children: ReactNode;
}

function ProtectedRoute({
  permission,
  children,
}: ProtectedRouteProps) {
  const {
    user,
    loading,
    hasPermission,
  } = useAuth();

  // Auth 載入中
  if (loading) {
    return (
      <main className="protected-route-loading">
        載入權限中...
      </main>
    );
  }

  // 尚未登入
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // 沒有權限
  if (!hasPermission(permission)) {
    return <Unauthorized />;
  }

  // 有權限
  return <>{children}</>;
}

export default ProtectedRoute;