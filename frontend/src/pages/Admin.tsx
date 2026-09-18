import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import API_BASE_URL from "../config/api";
import "./Admin.css";

interface AdminUser {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  is_active: boolean;
  permissions: string[];
}

function Admin() {
  const { session } = useAuth();

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingUserId, setSavingUserId] =
    useState<string | null>(null);

  // ========================================
  // 搜尋關鍵字
  // ========================================

  const [searchKeyword, setSearchKeyword] =
    useState("");

  // ========================================
  // 取得所有使用者
  // ========================================

  const fetchUsers = async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "取得使用者失敗",
        );
      }

      const data =
        await response.json();

      setUsers(data);
    } catch (error) {
      console.error(
        "取得使用者失敗:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 初始化
  // ========================================

  useEffect(() => {
    fetchUsers();
  }, [session]);

  // ========================================
  // 修改使用者權限
  // ========================================

  const updatePermissions = async (
    userId: string,
    permissions: string[],
  ) => {
    if (!session?.access_token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}/permissions`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            permissions,
          }),
        },
      );

      if (!response.ok) {
        const error =
          await response.json();

        throw new Error(
          error.detail ||
          "修改權限失敗",
        );
      }

      const updatedUser =
        await response.json();

      // 更新前端目前的使用者資料
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id
            ? {
                ...user,
                permissions:
                  updatedUser.permissions,
              }
            : user,
        ),
      );
    } catch (error) {
      console.error(
        "修改權限失敗:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "修改權限失敗",
      );
    }
  };

  // ========================================
  // 修改使用者顯示名稱
  // ========================================

  const updateDisplayName = async (
    userId: string,
    displayName: string,
  ) => {
    if (!session?.access_token) {
      return;
    }

    // 去除前後空白
    const trimmedName =
      displayName.trim();

    if (!trimmedName) {
      alert("顯示名稱不能為空");
      return;
    }

    try {
      // 設定目前正在儲存的使用者
      setSavingUserId(userId);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            display_name:
              trimmedName,
          }),
        },
      );

      if (!response.ok) {
        const error =
          await response.json();

        throw new Error(
          error.detail ||
          "修改顯示名稱失敗",
        );
      }

      const updatedUser =
        await response.json();

      // 更新畫面上的使用者資料
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id
            ? {
                ...user,
                display_name:
                  updatedUser.display_name,
              }
            : user,
        ),
      );

      alert("顯示名稱已更新");
    } catch (error) {
      console.error(
        "修改顯示名稱失敗:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "修改顯示名稱失敗",
      );
    } finally {
      setSavingUserId(null);
    }
  };

  // ========================================
  // Checkbox 權限變更
  // ========================================

  const handlePermissionChange = (
    user: AdminUser,
    permission: string,
    checked: boolean,
  ) => {
    const newPermissions =
      checked
        ? [
            ...user.permissions,
            permission,
          ]
        : user.permissions.filter(
            (item) =>
              item !== permission,
          );

    updatePermissions(
      user.id,
      newPermissions,
    );
  };

  // ========================================
  // 搜尋使用者
  // ========================================

  const normalizedSearchKeyword =
    searchKeyword.trim().toLowerCase();

  const filteredUsers =
    users.filter((user) => {
      // 沒有搜尋關鍵字時顯示全部
      if (!normalizedSearchKeyword) {
        return true;
      }

      // 將可以搜尋的資料組合起來
      const searchableText = [
        user.display_name,
        user.email,
        user.username,
        ...user.permissions,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearchKeyword,
      );
    });

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner" />

          <p>
            正在載入使用者資料...
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // Page
  // ========================================

  return (
    <main className="admin-page">

      {/* ================================== */}
      {/* 頁面標題 */}
      {/* ================================== */}

      <section className="admin-header">
        <div>
          <p className="admin-eyebrow">
            ADMINISTRATION
          </p>

          <h1 className="admin-title">
            使用者權限管理
          </h1>

          <p className="admin-description">
            管理網站使用者的顯示名稱與密室逃脫相關權限。
          </p>
        </div>

        <div className="admin-user-count">
          <span className="admin-user-count-number">
            {users.length}
          </span>

          <span className="admin-user-count-label">
            位使用者
          </span>
        </div>
      </section>

      {/* ================================== */}
      {/* 搜尋 */}
      {/* ================================== */}

      <div className="admin-search">

        <div className="admin-search-input-wrapper">

          <span className="admin-search-icon">
            🔍
          </span>

          <input
            type="search"
            className="admin-search-input"
            placeholder="搜尋顯示名稱、Email、帳號或權限..."
            value={searchKeyword}
            onChange={(event) =>
              setSearchKeyword(
                event.target.value,
              )
            }
          />

          {searchKeyword && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() =>
                setSearchKeyword("")
              }
              aria-label="清除搜尋"
            >
              ×
            </button>
          )}

        </div>

        <span className="admin-search-result">
          {searchKeyword
            ? `找到 ${filteredUsers.length} 位使用者`
            : `共 ${users.length} 位使用者`}
        </span>

      </div>

      {/* ================================== */}
      {/* 搜尋無結果 */}
      {/* ================================== */}

      {filteredUsers.length === 0 && (
        <div className="admin-empty">

          <div className="admin-empty-icon">
            🔍
          </div>

          <h2>
            找不到使用者
          </h2>

          <p>
            沒有符合「{searchKeyword}」的使用者。
          </p>

          <button
            type="button"
            className="admin-empty-button"
            onClick={() =>
              setSearchKeyword("")
            }
          >
            清除搜尋
          </button>

        </div>
      )}

      {/* ================================== */}
      {/* 使用者列表 */}
      {/* ================================== */}

      {filteredUsers.length > 0 && (
        <section className="admin-user-list">

          {filteredUsers.map((user) => {

            const isSelf =
              user.id ===
              session?.user.id;

            const isAdmin =
              user.permissions.includes(
                "admin",
              );

            return (
              <article
                key={user.id}
                className={`admin-user-card ${
                  isSelf
                    ? "admin-user-card-self"
                    : ""
                }`}
              >

                {/* ================================== */}
                {/* 使用者標題 */}
                {/* ================================== */}

                <div className="admin-user-header">

                  <div className="admin-user-avatar">
                    {(
                      user.display_name ||
                      user.email ||
                      user.username ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="admin-user-heading">

                    <div className="admin-user-name-row">

                      <h2>
                        {user.display_name ||
                          "未設定名稱"}
                      </h2>

                      {isSelf && (
                        <span className="admin-badge admin-badge-self">
                          目前登入
                        </span>
                      )}

                      {isAdmin && (
                        <span className="admin-badge admin-badge-admin">
                          管理員
                        </span>
                      )}

                    </div>

                    <p>
                      {user.email ||
                        "沒有 Email"}
                    </p>

                  </div>

                </div>

                {/* ================================== */}
                {/* 使用者資料 */}
                {/* ================================== */}

                <div className="admin-section">

                  <h3 className="admin-section-title">
                    使用者資料
                  </h3>

                  <div className="admin-field">

                    <label
                      htmlFor={`display-name-${user.id}`}
                    >
                      顯示名稱
                    </label>

                    <div className="admin-input-row">

                      <input
                        id={`display-name-${user.id}`}
                        type="text"
                        className="admin-input"
                        value={
                          user.display_name ||
                          ""
                        }
                        onChange={(event) => {

                          const newName =
                            event.target.value;

                          setUsers(
                            (currentUsers) =>
                              currentUsers.map(
                                (
                                  currentUser,
                                ) =>
                                  currentUser.id ===
                                  user.id
                                    ? {
                                        ...currentUser,
                                        display_name:
                                          newName,
                                      }
                                    : currentUser,
                              ),
                          );
                        }}
                      />

                      <button
                        type="button"
                        className="admin-save-button"
                        disabled={
                          savingUserId ===
                          user.id
                        }
                        onClick={() =>
                          updateDisplayName(
                            user.id,
                            user.display_name ||
                              "",
                          )
                        }
                      >
                        {savingUserId ===
                        user.id
                          ? "儲存中..."
                          : "儲存"}
                      </button>

                    </div>

                  </div>

                  <div className="admin-info-row">

                    <span className="admin-info-label">
                      Email
                    </span>

                    <span className="admin-info-value">
                      {user.email ||
                        "沒有 Email"}
                    </span>

                  </div>

                  <div className="admin-info-row">

                    <span className="admin-info-label">
                      帳號
                    </span>

                    <span className="admin-info-value">
                      {user.username ||
                        "沒有帳號名稱"}
                    </span>

                  </div>

                </div>

                {/* ================================== */}
                {/* 權限設定 */}
                {/* ================================== */}

                <div className="admin-section">

                  <h3 className="admin-section-title">
                    密室逃脫權限
                  </h3>

                  <div className="admin-permissions">

                    {/* 觀看密室 */}

                    <label
                      className={`admin-permission ${
                        isSelf
                          ? "admin-permission-disabled"
                          : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={user.permissions.includes(
                          "escape_room_view",
                        )}
                        disabled={isSelf}
                        onChange={(event) =>
                          handlePermissionChange(
                            user,
                            "escape_room_view",
                            event.target.checked,
                          )
                        }
                      />

                      <span className="admin-permission-content">

                        <span className="admin-permission-name">
                          可以觀看密室
                        </span>

                        <span className="admin-permission-description">
                          可以瀏覽密室逃脫內容
                        </span>

                      </span>

                    </label>

                    {/* 編輯密室 */}

                    <label
                      className={`admin-permission ${
                        isSelf
                          ? "admin-permission-disabled"
                          : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={user.permissions.includes(
                          "escape_room_edit",
                        )}
                        disabled={isSelf}
                        onChange={(event) =>
                          handlePermissionChange(
                            user,
                            "escape_room_edit",
                            event.target.checked,
                          )
                        }
                      />

                      <span className="admin-permission-content">

                        <span className="admin-permission-name">
                          可以編輯密室
                        </span>

                        <span className="admin-permission-description">
                          可以新增、修改與刪除密室資料
                        </span>

                      </span>

                    </label>

                  </div>

                  {isSelf && (
                    <p className="admin-permission-note">
                      為避免管理員意外失去權限，無法在此修改自己的權限。
                    </p>
                  )}

                </div>

              </article>
            );
          })}

        </section>
      )}

    </main>
  );
}

export default Admin;
