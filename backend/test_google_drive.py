import os

from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build


load_dotenv()


SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly"
]

CREDENTIALS_FILE = "credentials/service-account.json"


def main():
    print("開始測試 Google Drive...")

    credentials = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
    )

    print("✓ Service Account 驗證成功")

    service = build(
        "drive",
        "v3",
        credentials=credentials,
    )

    print("✓ Google Drive API 連線成功")

    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

    print(f"Folder ID: {folder_id}")

    query = (
        f"'{folder_id}' in parents "
        f"and trashed = false"
    )

    response = service.files().list(
        q=query,
        spaces="drive",
        fields="files(id, name, mimeType, size)",
        orderBy="name",
    ).execute()

    files = response.get("files", [])

    print(f"\n✓ 成功讀取資料夾，共 {len(files)} 個檔案\n")

    for file in files:
        print(
            f"名稱：{file['name']}"
            f" | ID：{file['id']}"
            f" | 類型：{file['mimeType']}"
        )


if __name__ == "__main__":
    main()