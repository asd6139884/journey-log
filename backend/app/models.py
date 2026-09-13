from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from .database import Base


# ========================================
# Escape Room
# ========================================

class EscapeRoom(Base):
    __tablename__ = "escape_rooms"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    studio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    dates: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    min_people: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    max_people: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    chih_yi: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    ya_ying: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    shi_xuan: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    can_wei: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    pin_xuan: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    bo_ru: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    dong: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    ming_hong: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    # EscapeRoom → Images
    images: Mapped[list["EscapeRoomImage"]] = relationship(
        back_populates="escape_room",
        cascade="all, delete-orphan",
    )


# ========================================
# Escape Room Image
# ========================================

class EscapeRoomImage(Base):
    __tablename__ = "escape_room_images"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    escape_room_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "escape_rooms.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    object_key: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        unique=True,
    )

    mime_type: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Image → EscapeRoom
    escape_room: Mapped["EscapeRoom"] = relationship(
        back_populates="images",
    )


# ========================================
# User
# ========================================

class User(Base):
    __tablename__ = "users"

    # 對應 Supabase auth.users.id
    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
    )

    # Google 登入後的 Email
    username: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        unique=True,
    )

    email: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Google 登入後顯示名稱
    display_name: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ------------------------------------
    # User → UserPermission
    # ------------------------------------

    user_permissions: Mapped[
        list["UserPermission"]
    ] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ------------------------------------
    # User → Permission
    #
    # 可以直接使用：
    #
    # user.permissions
    # ------------------------------------

    permissions: Mapped[
        list["Permission"]
    ] = relationship(
        secondary="user_permissions",
        back_populates="users",
        viewonly=True,
    )


# ========================================
# Permission
# ========================================

class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        unique=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ------------------------------------
    # Permission → UserPermission
    # ------------------------------------

    user_permissions: Mapped[
        list["UserPermission"]
    ] = relationship(
        back_populates="permission",
        cascade="all, delete-orphan",
    )

    # ------------------------------------
    # Permission → User
    #
    # 可以直接使用：
    #
    # permission.users
    # ------------------------------------

    users: Mapped[
        list["User"]
    ] = relationship(
        secondary="user_permissions",
        back_populates="permissions",
        viewonly=True,
    )


# ========================================
# User Permission
# ========================================

class UserPermission(Base):
    __tablename__ = "user_permissions"

    # 對應 users.id
    user_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    # 對應 permissions.id
    permission_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "permissions.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    # ------------------------------------
    # UserPermission → User
    # ------------------------------------

    user: Mapped["User"] = relationship(
        back_populates="user_permissions",
    )

    # ------------------------------------
    # UserPermission → Permission
    # ------------------------------------

    permission: Mapped["Permission"] = relationship(
        back_populates="user_permissions",
    )