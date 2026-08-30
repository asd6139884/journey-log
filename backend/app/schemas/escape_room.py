from typing import Dict

from pydantic import BaseModel


class EscapeRoom(BaseModel):
    id: int
    name: str
    company: str
    date: str
    location: str
    min_players: int | None = None
    max_players: int | None = None
    participants: Dict[str, bool]
    image_url: str | None = None