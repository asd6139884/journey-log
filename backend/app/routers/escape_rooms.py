import hashlib
from pathlib import Path
from io import BytesIO

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
import pillow_heif

from app.services.google_drive import get_drive_service
from app.services.google_sheets import get_escape_rooms


# ========================================
# 啟用 Pillow HEIC / HEIF 支援
# ========================================

pillow_heif.register_heif_opener()


router = APIRouter(
    prefix="/api/escape-rooms",
    tags=["Escape Rooms"],
)


# ========================================
# Server-side Image Cache
# ========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

IMAGE_CACHE_DIR = (
    BASE_DIR / "cache" / "images"
)

IMAGE_CACHE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ========================================
# Escape Rooms
# ========================================

@router.get("")
def read_escape_rooms():
    return get_escape_rooms()


# ========================================
# Image
# ========================================

@router.get("/images/{file_id}")
def get_escape_room_image(
    file_id: str,
    request: Request,
):
    service = get_drive_service()

    try:
        # ====================================
        # 1. 取得 Google Drive 圖片資訊
        # ====================================

        file = (
            service.files()
            .get(
                fileId=file_id,
                fields=(
                    "id,"
                    "mimeType,"
                    "modifiedTime,"
                    "md5Checksum"
                ),
            )
            .execute()
        )

        mime_type = file["mimeType"]

        modified_time = file.get(
            "modifiedTime",
            "",
        )

        md5_checksum = file.get(
            "md5Checksum",
            "",
        )


        # ====================================
        # 2. 建立 Cache Key
        #
        # file_id + modifiedTime
        #
        # Google Drive 圖片更新後，
        # modifiedTime 會改變，
        # 因此會產生新的 Cache。
        # ====================================

        cache_key = (
            f"{file_id}:{modified_time}"
        )

        cache_hash = hashlib.sha256(
            cache_key.encode("utf-8")
        ).hexdigest()


        # ====================================
        # 3. 決定 Cache 副檔名
        # ====================================

        is_heic = mime_type in {
            "image/heic",
            "image/heif",
        }

        if is_heic:
            cache_extension = ".jpg"
            response_mime_type = "image/jpeg"

        elif mime_type == "image/jpeg":
            cache_extension = ".jpg"
            response_mime_type = "image/jpeg"

        elif mime_type == "image/png":
            cache_extension = ".png"
            response_mime_type = "image/png"

        elif mime_type == "image/webp":
            cache_extension = ".webp"
            response_mime_type = "image/webp"

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported image type",
            )


        cache_path = (
            IMAGE_CACHE_DIR
            / f"{cache_hash}{cache_extension}"
        )


        # ====================================
        # 4. 產生 ETag
        # ====================================

        etag_source = (
            md5_checksum
            or cache_key
        )

        etag = (
            '"'
            + hashlib.md5(
                etag_source.encode("utf-8")
            ).hexdigest()
            + '"'
        )


        # ====================================
        # 5. Browser ETag Cache
        #
        # 如果瀏覽器已經有最新圖片，
        # 直接回 304。
        # ====================================

        if request.headers.get(
            "if-none-match"
        ) == etag:

            return Response(
                status_code=304,
                headers={
                    "ETag": etag,
                    "Cache-Control": (
                        "public, max-age=86400"
                    ),
                },
            )


        # ====================================
        # 6. Server-side Cache
        #
        # 如果 Server 已經有處理好的圖片，
        # 不需要再次下載 Google Drive。
        # ====================================

        if cache_path.exists():

            file_content = (
                cache_path.read_bytes()
            )

        else:

            # ==================================
            # 7. Server Cache 不存在
            #    從 Google Drive 下載
            # ==================================

            file_content = (
                service.files()
                .get_media(
                    fileId=file_id
                )
                .execute()
            )


            # ==================================
            # 8. HEIC / HEIF → JPEG
            # ==================================

            if is_heic:

                image = Image.open(
                    BytesIO(file_content)
                )

                # JPEG 不支援透明度
                if image.mode != "RGB":
                    image = image.convert(
                        "RGB"
                    )

                output = BytesIO()

                image.save(
                    output,
                    format="JPEG",
                    quality=85,
                    optimize=True,
                )

                file_content = (
                    output.getvalue()
                )


            # ==================================
            # 9. 寫入 Server Cache
            # ==================================

            cache_path.write_bytes(
                file_content
            )


        # ====================================
        # 10. 回傳圖片
        # ====================================

        return Response(
            content=file_content,
            media_type=response_mime_type,
            headers={
                "Cache-Control": (
                    "public, max-age=86400"
                ),
                "ETag": etag,
            },
        )


    except HTTPException:
        raise

    except Exception as e:

        print(
            f"取得圖片失敗: {e}"
        )

        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )
