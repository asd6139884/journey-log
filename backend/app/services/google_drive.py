import os

from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build


load_dotenv()


SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly"
]


CREDENTIALS_FILE = "credentials/service-account.json"


IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


GOOGLE_FOLDER_MIME_TYPE = (
    "application/vnd.google-apps.folder"
)


def get_drive_service():
    credentials = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
    )

    return build(
        "drive",
        "v3",
        credentials=credentials,
    )


def get_escape_room_images():
    """
    取得所有密室的圖片

    Google Drive 結構：

    主資料夾
    ├── 鬼新娘/
    │   ├── 01.jpg
    │   └── 02.jpg
    │
    ├── 奪命鎖鏈/
    │   └── 01.png
    │
    └── 瑪雅魔方/
        ├── 01.jpg
        └── 02.png


    回傳：

    {
        "鬼新娘": [
            {
                "id": "...",
                "name": "01.jpg",
                "mime_type": "image/jpeg"
            },
            {
                "id": "...",
                "name": "02.jpg",
                "mime_type": "image/jpeg"
            }
        ],

        "奪命鎖鏈": [
            {
                "id": "...",
                "name": "01.png",
                "mime_type": "image/png"
            }
        ]
    }
    """

    service = get_drive_service()

    root_folder_id = os.getenv(
        "GOOGLE_DRIVE_FOLDER_ID"
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


        # 建立該密室的圖片陣列
        images[room_name] = []


        for file in files:

            if file["mimeType"] not in IMAGE_MIME_TYPES:
                continue


            images[room_name].append(
                {
                    "id": file["id"],
                    "name": file["name"],
                    "mime_type": file["mimeType"],
                }
            )


    return images
