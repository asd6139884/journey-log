from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Location
from app.schemas.location import LocationCreate, LocationResponse


router = APIRouter(
    prefix="/api/locations",
    tags=["Locations"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[LocationResponse])
def get_locations(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Location).order_by(Location.name)
    )

    return result.scalars().all()


@router.post("", response_model=LocationResponse)
def create_location(
    data: LocationCreate,
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    location = Location(
        name=name,
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return location