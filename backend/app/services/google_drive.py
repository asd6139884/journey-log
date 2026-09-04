import os

from dotenv import load_dotenv
from googleapiclient.discovery import build

from app.services.google_auth import get_google_credentials


load_dotenv()


SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly"
]


IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}


def is_image_file(file):
    mime_type = file.get("mimeType", "").lower()

    return mime_type in IMAGE_MIME_TYPES

GOOGLE_FOLDER_MIME_TYPE = (
    "application/vnd.google-apps.folder"
)


def get_drive_service():
    credentials = get_google_credentials(
        SCOPES
    )

    return build(
        "drive",
        "v3",
        credentials=credentials,
    )


def get_escape_room_images():
    """
    取得所有密室的圖片
    """

    service = get_drive_service()

    root_folder_id = os.getenv(
        "GOOGLE_DRIVE_FOLDER_ID"
    )

    if not root_folder_id:
        raise RuntimeError(
            "找不到 GOOGLE_DRIVE_FOLDER_ID"
        )


    # ========================================
    # 1. 取得主資料夾底下所有密室資料夾
    # ========================================

    folder_query = (
        f"'{root_folder_id}' in parents "
        f"and mimeType = '{GOOGLE_FOLDER_MIME_TYPE}' "
        f"and trashed = false"
    )

    folder_response = service.files().list(
        q=folder_query,
        spaces="drive",
        fields="files(id, name, mimeType)",
        orderBy="name",
    ).execute()

    folders = folder_response.get(
        "files",
        []
    )


    images = {}


    # ========================================
    # 2. 逐一讀取每個密室資料夾
    # ========================================

    for folder in folders:

        room_name = folder["name"].strip()

        room_folder_id = folder["id"]


        # ====================================
        # 3. 取得該密室資料夾內所有圖片
        # ====================================

        image_query = (
            f"'{room_folder_id}' in parents "
            f"and trashed = false"
        )

        image_response = service.files().list(
            q=image_query,
            spaces="drive",
            fields="files(id, name, mimeType)",
            orderBy="name",
        ).execute()

        files = image_response.get(
            "files",
            []
        )


        images[room_name] = []


        for file in files:

            if not is_image_file(file):
                continue

            images[room_name].append(
                {
                    "id": file["id"],
                    "name": file["name"],
                    "mime_type": file["mimeType"],
                }
            )


    return images