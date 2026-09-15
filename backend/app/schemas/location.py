from datetime import datetime

from pydantic import BaseModel


class LocationCreate(BaseModel):
    name: str


class LocationResponse(BaseModel):
    id: int
    name: str
    created_at: datetime