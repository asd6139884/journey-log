import os

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from sqlalchemy.orm import Session

from app.models import User


# ========================================
# Supabase 設定
# ========================================

SUPABASE_URL = os.getenv(
    "SUPABASE_URL"
)

if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL environment variable is required"
    )

SUPABASE_URL = SUPABASE_URL.rstrip("/")

SUPABASE_ISSUER = (
    f"{SUPABASE_URL}/auth/v1"
)

SUPABASE_JWKS_URL = (
    f"{SUPABASE_ISSUER}/.well-known/jwks.json"
)


# ========================================
# Supabase JWT
# ========================================

jwks_client = PyJWKClient(
    SUPABASE_JWKS_URL
)


def verify_supabase_token(
    token: str,
) -> dict:
    """
    驗證 Supabase Access Token。

    驗證：
    - JWT 簽章
    - issuer
    - audience
    - expiration

    成功：
        回傳 JWT payload

    失敗：
        拋出 401
    """

    try:
        signing_key = (
            jwks_client
            .get_signing_key_from_jwt(token)
        )

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[
                "ES256",
                "RS256",
            ],
            audience="authenticated",
            issuer=SUPABASE_ISSUER,
        )

        return payload

    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="登入已失效或 Token 無效",
        ) from exc


# ========================================
# Current User
# ========================================

def get_current_user(
    db: Session,
    token: str,
) -> User:
    """
    驗證 Supabase Token，
    並取得目前登入的網站使用者。

    如果 Supabase 使用者第一次登入，
    自動建立網站 users 資料。
    """

    payload = verify_supabase_token(
        token
    )

    # ------------------------------------
    # 取得 Supabase Auth User ID
    # ------------------------------------

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 缺少使用者 ID",
        )

    # ------------------------------------
    # 查詢網站 users
    # ------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    # ------------------------------------
    # 第一次登入
    # ------------------------------------

    if user is None:
        email = payload.get("email")

        user = User(
            id=user_id,
            email=email,
            username=email,
            display_name=email,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # ------------------------------------
    # 檢查帳號是否啟用
    # ------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="帳號已停用",
        )

    return user


# ========================================
# Permission
# ========================================

def get_user_permissions(
    user: User,
) -> list[str]:
    """
    取得使用者所有權限名稱。
    """

    return [
        permission.name
        for permission in user.permissions
    ]


def has_permission(
    user: User,
    permission_name: str,
) -> bool:
    """
    判斷使用者是否具有指定權限。
    """

    return any(
        permission.name == permission_name
        for permission in user.permissions
    )