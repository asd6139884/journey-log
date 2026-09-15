from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Studio
from app.schemas.studio import StudioCreate, StudioResponse


router = APIRouter(
    prefix="/api/studios",
    tags=["Studios"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[StudioResponse])
def get_studios(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Studio).order_by(Studio.name)
    )

    return result.scalars().all()


@router.post("", response_model=StudioResponse)
def create_studio(
    data: StudioCreate,
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    studio = Studio(
        name=name,
    )

    db.add(studio)
    db.commit()
    db.refresh(studio)

    return studio