import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "../lib/supabase";

import API_BASE_URL from "../config/api";


// ========================================
// Backend User
// ========================================

export interface BackendUser {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  permissions: string[];
}


// ========================================
// Auth Context
// ========================================

interface AuthContextValue {
  user: User | null;

  session: Session | null;

  backendUser: BackendUser | null;

  permissions: string[];

  loading: boolean;

  hasPermission: (
    permission: string,
  ) => boolean;

  signInWithGoogle: () => Promise<void>;

  logout: () => Promise<void>;
}


const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);


// ========================================
// Provider Props
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}


// ========================================
// Auth Provider
// ========================================

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [backendUser, setBackendUser] =
    useState<BackendUser | null>(null);

  const [permissions, setPermissions] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);


  // ======================================
  // 清除登入資料
  // ======================================

  function clearAuth() {
    setUser(null);
    setSession(null);
    setBackendUser(null);
    setPermissions([]);
  }


  // ======================================
  // 取得 Backend 使用者
  // ======================================

  async function fetchBackendUser(
    currentSession: Session,
  ) {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${currentSession.access_token}`,
            },
          },
        );


      if (!response.ok) {
        console.error(
          "Backend Auth API 失敗:",
          response.status,
        );

        setBackendUser(null);
        setPermissions([]);

        return;
      }


      const data: BackendUser =
        await response.json();


      setBackendUser(data);

      setPermissions(
        data.permissions ?? [],
      );

    } catch (error) {
      console.error(
        "無法取得 Backend User:",
        error,
      );

      setBackendUser(null);
      setPermissions([]);
    }
  }


  // ======================================
  // 初始化 Auth
  // ======================================

  useEffect(() => {
    let mounted = true;


    async function initializeAuth() {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();


        if (!mounted) {
          return;
        }


        setSession(session);

        setUser(
          session?.user ?? null,
        );


        if (session) {
          await fetchBackendUser(
            session,
          );
        } else {
          setBackendUser(null);
          setPermissions([]);
        }

      } catch (error) {
        console.error(
          "初始化登入狀態失敗:",
          error,
        );

        if (mounted) {
          clearAuth();
        }

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }


    initializeAuth();


    // ====================================
    // 監聽 Supabase Auth
    // ====================================

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          currentSession,
        ) => {
          if (!mounted) {
            return;
          }


          setSession(
            currentSession,
          );

          setUser(
            currentSession?.user ?? null,
          );


          if (currentSession) {
            await fetchBackendUser(
              currentSession,
            );
          } else {
            setBackendUser(null);
            setPermissions([]);
          }


          setLoading(false);
        },
      );


    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);


  // ======================================
  // Google Login
  // ======================================

  async function signInWithGoogle() {
    const {
      error,
    } =
      await supabase.auth.signInWithOAuth(
        {
          provider: "google",

          options: {
            redirectTo:
              window.location.origin,
          },
        },
      );


    if (error) {
      throw error;
    }
  }


  // ======================================
  // Logout
  // ======================================

  async function logout() {
    const {
      error,
    } =
      await supabase.auth.signOut();


    if (error) {
      throw error;
    }


    clearAuth();
  }


  // ======================================
  // Permission
  // ======================================

  function hasPermission(
    permission: string,
  ): boolean {
    return permissions.includes(
      permission,
    );
  }


  // ======================================
  // Context
  // ======================================

  return (
    <AuthContext.Provider
      value={{
        user,

        session,

        backendUser,

        permissions,

        loading,

        hasPermission,

        signInWithGoogle,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ========================================
// useAuth
// ========================================

export function useAuth() {
  const context =
    useContext(AuthContext);


  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }


  return context;
}