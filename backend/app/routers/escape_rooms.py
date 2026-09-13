import uuid
from io import BytesIO

import pillow_heif
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from PIL import Image
from sqlalchemy.orm import Session

from app.database import get_db

from app.dependencies.auth import (
    require_permission,
)

# SQLAlchemy Model
from app.models import (
    EscapeRoom as EscapeRoomModel,
    EscapeRoomImage,
)

# Pydantic Schema
from app.schemas.escape_room import (
    EscapeRoom,
    EscapeRoomImageUploadResponse,
    EscapeRoomInput,
)

from app.services.b2_storage import (
    delete_file,
    upload_file,
)

from app.services.escape_rooms import (
    build_image_url,
    get_escape_room,
    get_escape_rooms,
)


pillow_heif.register_heif_opener()


router = APIRouter(
    prefix="/api/escape-rooms",
    tags=["Escape Rooms"],
)


# ========================================
# GET All Escape Rooms
# Permission:
#     escape_room_view
# ========================================

@router.get(
    "",
    response_model=list[EscapeRoom],
)
def read_escape_rooms(
    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_view"
        )
    ),
):
    return get_escape_rooms(db)


# ========================================
# CREATE Escape Room
# Permission:
#     escape_room_edit
# ========================================

@router.post(
    "",
    response_model=EscapeRoom,
)
def create_escape_room(
    data: EscapeRoomInput,

    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_edit"
        )
    ),
):
    room = EscapeRoomModel(
        name=data.name,
        studio=data.company,
        dates=data.date,
        location=data.location,
        min_people=data.min_players,
        max_people=data.max_players,

        chih_yi=data.participants.get(
            "智一",
            False,
        ),

        ya_ying=data.participants.get(
            "亞穎",
            False,
        ),

        shi_xuan=data.participants.get(
            "仕瑄",
            False,
        ),

        can_wei=data.participants.get(
            "燦為",
            False,
        ),

        pin_xuan=data.participants.get(
            "品瑄",
            False,
        ),

        bo_ru=data.participants.get(
            "柏儒",
            False,
        ),

        dong=data.participants.get(
            "董",
            False,
        ),

        ming_hong=data.participants.get(
            "明鴻",
            False,
        ),
    )

    try:
        db.add(room)
        db.commit()
        db.refresh(room)

    except Exception as e:
        db.rollback()

        print(
            f"Database create failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create escape room",
        )

    created_room = get_escape_room(
        db,
        room.id,
    )

    if created_room is None:
        raise HTTPException(
            status_code=404,
            detail="Escape room not found",
        )

    return created_room


# ========================================
# GET Single Escape Room
# Permission:
#     escape_room_view
# ========================================

@router.get(
    "/{escape_room_id}",
    response_model=EscapeRoom,
)
def read_escape_room(
    escape_room_id: int,

    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_view"
        )
    ),
):
    room = get_escape_room(
        db,
        escape_room_id,
    )

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Escape room not found",
        )

    return room


# ========================================
# UPDATE Escape Room
# Permission:
#     escape_room_edit
# ========================================

@router.put(
    "/{escape_room_id}",
    response_model=EscapeRoom,
)
def update_escape_room(
    escape_room_id: int,

    data: EscapeRoomInput,

    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_edit"
        )
    ),
):
    room = (
        db.query(EscapeRoomModel)
        .filter(
            EscapeRoomModel.id
            == escape_room_id
        )
        .first()
    )

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Escape room not found",
        )

    room.name = data.name
    room.studio = data.company
    room.dates = data.date
    room.location = data.location
    room.min_people = data.min_players
    room.max_people = data.max_players

    participants = data.participants

    room.chih_yi = participants.get(
        "智一",
        False,
    )

    room.ya_ying = participants.get(
        "亞穎",
        False,
    )

    room.shi_xuan = participants.get(
        "仕瑄",
        False,
    )

    room.can_wei = participants.get(
        "燦為",
        False,
    )

    room.pin_xuan = participants.get(
        "品瑄",
        False,
    )

    room.bo_ru = participants.get(
        "柏儒",
        False,
    )

    room.dong = participants.get(
        "董",
        False,
    )

    room.ming_hong = participants.get(
        "明鴻",
        False,
    )

    try:
        db.commit()
        db.refresh(room)

    except Exception as e:
        db.rollback()

        print(
            f"Database update failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update escape room",
        )

    updated_room = get_escape_room(
        db,
        escape_room_id,
    )

    if updated_room is None:
        raise HTTPException(
            status_code=404,
            detail="Escape room not found",
        )

    return updated_room


# ========================================
# DELETE Escape Room
# Permission:
#     escape_room_edit
# ========================================

@router.delete(
    "/{escape_room_id}"
)
def delete_escape_room(
    escape_room_id: int,

    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_edit"
        )
    ),
):
    room = (
        db.query(EscapeRoomModel)
        .filter(
            EscapeRoomModel.id
            == escape_room_id
        )
        .first()
    )

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Escape room not found",
        )

    images = (
        db.query(EscapeRoomImage)
        .filter(
            EscapeRoomImage.escape_room_id
            == escape_room_id
        )
        .all()
    )

    # ------------------------------------
    # Delete images from B2
    # ------------------------------------

    for image in images:
        try:
            delete_file(
                image.object_key
            )

        except Exception as e:
            print(
                "B2 image delete failed: "
                f"{image.object_key} - {e}"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to delete image "
                    "from storage"
                ),
            )

    # ------------------------------------
    # Delete database records
    # ------------------------------------

    try:
        for image in images:
            db.delete(image)

        db.delete(room)

        db.commit()

    except Exception as e:
        db.rollback()

        print(
            f"Database delete failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete escape room",
        )

    return {
        "message": (
            "Escape room deleted successfully"
        ),
        "id": escape_room_id,
    }


# ========================================
# UPLOAD Escape Room Image
# Permission:
#     escape_room_edit
# ========================================

@router.post(
    "/{escape_room_id}/images",
    response_model=EscapeRoomImageUploadResponse,
)
async def upload_escape_room_image(
    escape_room_id: int,

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_edit"
        )
    ),
):
    room = (
        db.query(EscapeRoomModel)
        .filter(
            EscapeRoomModel.id
            == escape_room_id
        )
        .first()
    )

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Escape room not found",
        )

    # ========================================
    # Validate file type
    # ========================================

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type",
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Empty file",
        )

    # ========================================
    # HEIC / HEIF → WebP
    # ========================================

    is_heic = file.content_type in {
        "image/heic",
        "image/heif",
    }

    if is_heic:
        try:
            image = Image.open(
                BytesIO(file_content)
            )

            if image.mode != "RGB":
                image = image.convert("RGB")

            output = BytesIO()

            image.save(
                output,
                format="WEBP",
                quality=85,
                method=6,
            )

            file_content = output.getvalue()

            upload_mime_type = "image/webp"

        except Exception as e:
            print(
                f"HEIC conversion failed: {e}"
            )

            raise HTTPException(
                status_code=400,
                detail="Invalid HEIC image",
            )

    else:
        upload_mime_type = file.content_type

    # ========================================
    # Determine extension
    # ========================================

    if upload_mime_type == "image/jpeg":
        extension = ".jpg"

    elif upload_mime_type == "image/png":
        extension = ".png"

    elif upload_mime_type == "image/webp":
        extension = ".webp"

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type",
        )

    # ========================================
    # Generate B2 object key
    # ========================================

    object_key = (
        f"escape-rooms/"
        f"{escape_room_id}/"
        f"{uuid.uuid4()}"
        f"{extension}"
    )

    # ========================================
    # Upload to B2
    # ========================================

    try:
        upload_file(
            file_content=file_content,
            object_key=object_key,
            content_type=upload_mime_type,
        )

    except Exception as e:
        print(
            f"B2 upload failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to upload image",
        )

    # ========================================
    # Create DB image record
    # ========================================

    image_record = EscapeRoomImage(
        escape_room_id=escape_room_id,
        name=file.filename or "image",
        object_key=object_key,
        mime_type=upload_mime_type,
    )

    try:
        db.add(image_record)
        db.commit()
        db.refresh(image_record)

    except Exception as e:
        db.rollback()

        # Rollback B2 upload
        try:
            delete_file(object_key)

        except Exception as delete_error:
            print(
                "Failed to rollback B2 file: "
                f"{delete_error}"
            )

        print(
            f"Database insert failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save image "
                "information"
            ),
        )

    # ========================================
    # Response
    # ========================================

    return {
        "id": image_record.id,

        "escape_room_id":
            image_record.escape_room_id,

        "name":
            image_record.name,

        "object_key":
            image_record.object_key,

        "mime_type":
            image_record.mime_type,

        "image_url":
            build_image_url(
                image_record.object_key
            ),

        "created_at":
            image_record.created_at,
    }


# ========================================
# DELETE Escape Room Image
# Permission:
#     escape_room_edit
# ========================================

@router.delete(
    "/{escape_room_id}/images/{image_id}"
)
def delete_escape_room_image(
    escape_room_id: int,

    image_id: int,

    db: Session = Depends(get_db),

    user=Depends(
        require_permission(
            "escape_room_edit"
        )
    ),
):
    image = (
        db.query(EscapeRoomImage)
        .filter(
            EscapeRoomImage.id == image_id,

            EscapeRoomImage.escape_room_id
            == escape_room_id,
        )
        .first()
    )

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    object_key = image.object_key

    # ========================================
    # Delete from B2
    # ========================================

    try:
        delete_file(object_key)

    except Exception as e:
        print(
            "B2 image delete failed: "
            f"{object_key} - {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to delete image "
                "from storage"
            ),
        )

    # ========================================
    # Delete DB record
    # ========================================

    try:
        db.delete(image)
        db.commit()

    except Exception as e:
        db.rollback()

        print(
            f"Database image delete failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete image",
        )

    return {
        "message": "Image deleted successfully",
        "id": image_id,
    }