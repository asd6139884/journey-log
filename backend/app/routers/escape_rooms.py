from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.services.google_drive import get_drive_service
from app.services.google_sheets import get_escape_rooms


router = APIRouter(
    prefix="/api/escape-rooms",
    tags=["Escape Rooms"],
)


@router.get("")
def read_escape_rooms():
    return get_escape_rooms()


@router.get("/images/{file_id}")
def get_escape_room_image(file_id: str):
    service = get_drive_service()

    try:
        file = service.files().get(
            fileId=file_id,
            fields="mimeType",
        ).execute()

        file_content = (
            service.files()
            .get_media(fileId=file_id)
            .execute()
        )

        return Response(
            content=file_content,
            media_type=file["mimeType"],
        )

    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )