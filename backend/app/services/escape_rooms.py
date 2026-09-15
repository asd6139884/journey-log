import os

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    EscapeRoom,
    EscapeRoomImage,
    Studio,
    Location,
)


# ========================================
# Participants
# ========================================

PARTICIPANTS = {
    "智一": "chih_yi",
    "亞穎": "ya_ying",
    "仕瑄": "shi_xuan",
    "燦為": "can_wei",
    "品瑄": "pin_xuan",
    "柏儒": "bo_ru",
    "董": "dong",
    "明鴻": "ming_hong",
}


# ========================================
# Cloudflare Image Worker
# ========================================

IMAGE_WORKER_URL = os.getenv(
    "IMAGE_WORKER_URL",
    "https://journey-log-image.asd6139884.workers.dev",
).rstrip("/")


# ========================================
# 建立圖片 URL
# ========================================

def build_image_url(
    object_key: str,
) -> str:
    return (
        f"{IMAGE_WORKER_URL}/"
        f"{object_key}"
    )


# ========================================
# 建立單一密室 Response
# ========================================

def _build_room_response(
    room: EscapeRoom,
    room_images: list[EscapeRoomImage],
    studio: Studio | None = None,
    location: Location | None = None,
) -> dict:
    # ====================================
    # 參加者
    # ====================================

    participants = {
        name: bool(
            getattr(
                room,
                column,
            )
        )
        for name, column in PARTICIPANTS.items()
    }

    # ====================================
    # 圖片
    # ====================================

    image_list = []

    for image in room_images:
        image_list.append(
            {
                "id": image.id,
                "name": image.name,
                "mime_type": image.mime_type,
                "object_key": image.object_key,
                "image_url": build_image_url(
                    image.object_key
                ),
                "created_at": image.created_at,
            }
        )

    # ====================================
    # Escape Room
    # ====================================

    return {
        "id": room.id,
        "name": room.name,

        # 工作室
        "studio_id": room.studio_id,
        "studio_name": (
            studio.name
            if studio is not None
            else None
        ),

        # 多個日期
        "dates": room.dates or [],

        # 地點
        "location_id": room.location_id,
        "location_name": (
            location.name
            if location is not None
            else None
        ),

        # 人數
        "min_people": room.min_people,
        "max_people": room.max_people,

        # 參加者
        "participants": participants,

        # 圖片
        "images": image_list,
    }


# ========================================
# 取得所有密室
# ========================================

def get_escape_rooms(
    db: Session,
) -> list[dict]:
    # ====================================
    # 取得所有密室
    #
    # EscapeRoom
    #   ↓ studio_id
    # Studio
    #
    # EscapeRoom
    #   ↓ location_id
    # Location
    # ====================================

    stmt = (
        select(
            EscapeRoom,
            Studio,
            Location,
        )
        .outerjoin(
            Studio,
            EscapeRoom.studio_id == Studio.id,
        )
        .outerjoin(
            Location,
            EscapeRoom.location_id == Location.id,
        )
        .order_by(EscapeRoom.id)
    )

    rows = db.execute(stmt).all()

    # ====================================
    # 取得所有圖片
    # ====================================

    image_stmt = (
        select(EscapeRoomImage)
        .order_by(EscapeRoomImage.id)
    )

    images = db.scalars(image_stmt).all()

    # ====================================
    # 建立圖片索引
    # ====================================

    images_by_room: dict[
        int,
        list[EscapeRoomImage],
    ] = {}

    for image in images:
        images_by_room.setdefault(
            image.escape_room_id,
            [],
        ).append(image)

    # ====================================
    # 建立 Response
    # ====================================

    result = []

    for room, studio, location in rows:
        room_images = images_by_room.get(
            room.id,
            [],
        )

        result.append(
            _build_room_response(
                room,
                room_images,
                studio,
                location,
            )
        )

    return result


# ========================================
# 取得單一密室
# ========================================

def get_escape_room(
    db: Session,
    escape_room_id: int,
) -> dict | None:
    # ====================================
    # 找密室 + 工作室 + 地點
    # ====================================

    stmt = (
        select(
            EscapeRoom,
            Studio,
            Location,
        )
        .outerjoin(
            Studio,
            EscapeRoom.studio_id == Studio.id,
        )
        .outerjoin(
            Location,
            EscapeRoom.location_id == Location.id,
        )
        .where(
            EscapeRoom.id == escape_room_id
        )
    )

    row = db.execute(stmt).first()

    if row is None:
        return None

    room, studio, location = row

    # ====================================
    # 取得這間密室的圖片
    # ====================================

    image_stmt = (
        select(EscapeRoomImage)
        .where(
            EscapeRoomImage.escape_room_id
            == escape_room_id
        )
        .order_by(EscapeRoomImage.id)
    )

    images = db.scalars(image_stmt).all()

    # ====================================
    # 建立 Response
    # ====================================

    return _build_room_response(
        room,
        images,
        studio,
        location,
    )
