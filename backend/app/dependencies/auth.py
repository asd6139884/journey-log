from fastapi import (
    Depends,
    Header,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services.auth import (
    get_current_user,
    has_permission,
)


# ========================================
# 取得目前登入使用者
# ========================================

def get_current_user_dependency(
    authorization: str | None = Header(
        default=None,
    ),
    db: Session = Depends(get_db),
) -> User:
    """
    從 Authorization Header 取得
    Supabase Access Token，
    並取得目前登入的網站使用者。
    """

    # ------------------------------------
    # 檢查 Authorization
    # ------------------------------------

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登入",
        )

    if not authorization.startswith(
        "Bearer "
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無效的 Authorization",
        )

    token = authorization[
        len("Bearer "):
    ].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未提供 Token",
        )

    # ------------------------------------
    # 驗證 Supabase Token
    # ------------------------------------

    return get_current_user(
        db,
        token,
    )


# ========================================
# 權限檢查
# ========================================

def require_permission(
    permission_name: str,
):
    """
    建立指定權限的 FastAPI Dependency。

    使用：

        Depends(
            require_permission(
                "escape_room_view"
            )
        )
    """

    def permission_checker(
        user: User = Depends(
            get_current_user_dependency
        ),
    ) -> User:

        if not has_permission(
            user,
            permission_name,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"沒有 {permission_name} 權限"
                ),
            )

        return user

    return permission_checker