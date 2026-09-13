from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.dependencies.auth import (
    get_current_user_dependency,
)

from app.services.auth import (
    get_current_user,
    get_user_permissions,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)


# ========================================
# Current User
# ========================================

@router.get(
    "/me",
)
def get_me(
    authorization: str | None = Header(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    """
    取得目前登入使用者。

    Frontend：
        Authorization: Bearer <access_token>
    """

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="未登入",
        )


    if not authorization.startswith(
        "Bearer "
    ):
        raise HTTPException(
            status_code=401,
            detail="無效的 Authorization",
        )


    token = authorization[
        len("Bearer "):
    ].strip()


    if not token:
        raise HTTPException(
            status_code=401,
            detail="未提供 Token",
        )


    user = get_current_user(
        db,
        token,
    )


    permissions = get_user_permissions(
        user,
    )


    return {
        "id": str(user.id),

        "email": user.email,

        "username": user.username,

        "display_name":
            user.display_name,

        "permissions":
            permissions,
    }