from datetime import datetime
from typing import Dict

from pydantic import BaseModel, Field


# ========================================
# Escape Room Image
# ========================================

class EscapeRoomImageResponse(BaseModel):
    id: int
    name: str
    mime_type: str
    object_key: str
    image_url: str
    created_at: datetime


class EscapeRoomImageUploadResponse(
    EscapeRoomImageResponse
):
    escape_room_id: int


# ========================================
# Escape Room Response
# ========================================

class EscapeRoom(BaseModel):
    id: int

    name: str

    # 工作室 ID
    studio_id: int | None = None

    # 工作室名稱
    studio_name: str | None = None

    # 一個密室可以有多個日期
    #
    # 例如：
    #
    # [
    #     "2026-09-20",
    #     "2026-10-03",
    #     "2026-10-17"
    # ]
    dates: list[str] = Field(
        default_factory=list
    )

    # 地點 ID
    location_id: int | None = None

    # 地點名稱
    location_name: str | None = None
    
    min_people: int | None = None

    max_people: int | None = None

    participants: Dict[str, bool]

    images: list[EscapeRoomImageResponse] = Field(
        default_factory=list
    )


# ========================================
# Escape Room Input
# ========================================

class EscapeRoomInput(BaseModel):
    name: str

    # 工作室 ID
    studio_id: int | None = None

    # 一個密室可以有多個日期
    dates: list[str] = Field(
        default_factory=list
    )

    # 地點 ID
    location_id: int | None = None

    min_people: int | None = None

    max_people: int | None = None

    participants: Dict[str, bool]
