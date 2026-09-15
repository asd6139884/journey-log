from datetime import datetime

from pydantic import BaseModel


class StudioCreate(BaseModel):
    name: str


class StudioResponse(BaseModel):
    id: int
    name: str
    created_at: datetime