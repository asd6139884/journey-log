import os

import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv


load_dotenv()


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]

CREDENTIALS_FILE = "credentials/service-account.json"


def main():
    print("開始測試 Google Sheets...")

    credentials = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
    )

    print("✓ Service Account 驗證成功")

    client = gspread.authorize(credentials)

    print("✓ Google API 連線成功")

    spreadsheet_id = os.getenv("GOOGLE_SHEET_ID")
    sheet_name = os.getenv("GOOGLE_SHEET_NAME")

    print(f"Spreadsheet ID: {spreadsheet_id}")
    print(f"Worksheet: {sheet_name}")

    spreadsheet = client.open_by_key(spreadsheet_id)

    print(f"✓ 成功開啟 Google Sheet：{spreadsheet.title}")

    worksheet = spreadsheet.worksheet(sheet_name)

    print(f"✓ 成功開啟工作表：{worksheet.title}")

    records = worksheet.get_all_records()

    print(f"✓ 成功讀取資料，共 {len(records)} 筆")

    print("\n資料內容：")
    for record in records:
        print(record)


if __name__ == "__main__":
    main()
