from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel

from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import (
    require_permission,
)
from app.models import (
    User,
    Permission,
    UserPermission,
)
from app.services.auth import (
    get_user_permissions,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


# ========================================
# Get All Users
# ========================================

@router.get(
    "/users",
)
def get_users(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_permission("admin")
    ),
):
    """
    取得所有網站使用者。

    只有具有 admin 權限的使用者
    才能呼叫這個 API。
    """

    users = (
        db.query(User)
        .order_by(
            User.created_at
        )
        .all()
    )

    return [
        {
            "id": str(user.id),

            "email": user.email,

            "username": user.username,

            "display_name":
                user.display_name,

            "is_active":
                user.is_active,

            "permissions":
                get_user_permissions(
                    user
                ),
        }
        for user in users
    ]

# ========================================
# Update User Profile
# ========================================

class UpdateUserProfileRequest(
    BaseModel
):
    display_name: str


@router.put(
    "/users/{user_id}",
)
def update_user_profile(
    user_id: str,

    data: UpdateUserProfileRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_permission("admin")
    ),
):
    """
    修改指定使用者的基本資料。

    目前 Admin 可以修改：

    - display_name

    不修改：

    - email
    - username
    - admin 權限
    """

    # ------------------------------------
    # 1. 找到目標使用者
    # ------------------------------------

    target_user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if target_user is None:
        raise HTTPException(
            status_code=404,
            detail="找不到使用者",
        )


    # ------------------------------------
    # 2. 檢查 display_name
    # ------------------------------------

    display_name = (
        data.display_name.strip()
    )

    if not display_name:
        raise HTTPException(
            status_code=400,
            detail="顯示名稱不能為空",
        )


    # ------------------------------------
    # 3. 修改 display_name
    # ------------------------------------

    target_user.display_name = (
        display_name
    )


    # ------------------------------------
    # 4. 儲存
    # ------------------------------------

    db.commit()

    db.refresh(target_user)


    # ------------------------------------
    # 5. 回傳更新後的資料
    # ------------------------------------

    return {
        "id": str(target_user.id),

        "email":
            target_user.email,

        "username":
            target_user.username,

        "display_name":
            target_user.display_name,
    }

# ========================================
# Update User Permissions
# ========================================

class UpdateUserPermissionsRequest(
    BaseModel
):
    permissions: list[str]


@router.put(
    "/users/{user_id}/permissions",
)
def update_user_permissions(
    user_id: str,

    data: UpdateUserPermissionsRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_permission("admin")
    ),
):
    """
    修改指定使用者的密室權限。

    Admin 可以管理：

    - escape_room_view
    - escape_room_edit

    不允許透過這個 API 修改 admin。
    """

    # ------------------------------------
    # 1. 不能修改自己的權限
    # ------------------------------------

    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=400,
            detail="不能修改自己的權限",
        )


    # ------------------------------------
    # 2. 找到目標使用者
    # ------------------------------------

    target_user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if target_user is None:
        raise HTTPException(
            status_code=404,
            detail="找不到使用者",
        )


    # ------------------------------------
    # 3. 只允許管理這兩個權限
    # ------------------------------------

    allowed_permissions = {
        "escape_room_view",
        "escape_room_edit",
    }

    requested_permissions = set(
        data.permissions
    )

    invalid_permissions = (
        requested_permissions
        - allowed_permissions
    )

    if invalid_permissions:
        raise HTTPException(
            status_code=400,
            detail=(
                "不允許修改這些權限："
                + ", ".join(
                    sorted(
                        invalid_permissions
                    )
                )
            ),
        )


    # ------------------------------------
    # 4. 找出要設定的 Permission
    # ------------------------------------

    permissions = (
        db.query(Permission)
        .filter(
            Permission.name.in_(
                requested_permissions
            )
        )
        .all()
    )


    # ------------------------------------
    # 5. 只清除兩個可管理的權限
    # ------------------------------------

    manageable_permission_ids = (
        db.query(Permission.id)
        .filter(
            Permission.name.in_(
                allowed_permissions
            )
        )
    )

    db.query(UserPermission).filter(
        UserPermission.user_id
        == target_user.id
    ).filter(
        UserPermission.permission_id.in_(
            manageable_permission_ids
        )
    ).delete(
        synchronize_session=False
    )


    # ------------------------------------
    # 6. 建立新的權限
    # ------------------------------------

    for permission in permissions:
        db.add(
            UserPermission(
                user_id=target_user.id,
                permission_id=permission.id,
            )
        )


    # ------------------------------------
    # 7. 儲存
    # ------------------------------------

    db.commit()


    # ------------------------------------
    # 8. 重新取得使用者
    # ------------------------------------

    db.refresh(target_user)

    return {
        "id": str(target_user.id),

        "permissions":
            get_user_permissions(
                target_user
            ),
    }