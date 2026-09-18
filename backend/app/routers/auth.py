from fastapi import (
    APIRouter,
    Depends,
)

from app.models import User

from app.dependencies.auth import (
    get_current_user_dependency,
)

from app.services.auth import (
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
    user: User = Depends(
        get_current_user_dependency
    ),
):
    """
    取得目前登入使用者。

    Frontend：
        Authorization: Bearer <access_token>
    """

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