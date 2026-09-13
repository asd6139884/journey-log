from datetime import datetime
from typing import Dict

from pydantic import BaseModel, Field


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


class EscapeRoom(BaseModel):
    id: int
    name: str
    company: str
    date: str
    location: str
    min_players: int | None = None
    max_players: int | None = None
    participants: Dict[str, bool]

    images: list[EscapeRoomImageResponse] = Field(
        default_factory=list
    )


class EscapeRoomInput(BaseModel):
    name: str
    company: str
    date: str
    location: str
    min_players: int | None = None
    max_players: int | None = None
    participants: Dict[str, bool]