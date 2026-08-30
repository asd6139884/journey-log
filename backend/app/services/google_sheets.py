import os

import gspread
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials

from app.services.google_drive import get_escape_room_images


load_dotenv()


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]

CREDENTIALS_FILE = "credentials/service-account.json"


PARTICIPANTS = [
    "智一",
    "亞穎",
    "仕瑄",
    "燦為",
    "品瑄",
    "柏儒",
    "董",
    "明鴻",
]


def get_worksheet():
    """
    連線 Google Sheets
    """

    credentials = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
    )

    client = gspread.authorize(credentials)

    spreadsheet = client.open_by_key(
        os.getenv("GOOGLE_SHEET_ID")
    )

    worksheet = spreadsheet.worksheet(
        os.getenv("GOOGLE_SHEET_NAME")
    )

    return worksheet


def parse_bool(value):
    """
    將 Google Sheet 的 TRUE / FALSE
    轉成 Python bool
    """

    if isinstance(value, bool):
        return value

    return str(value).strip().lower() == "true"


def parse_int(value):
    """
    將人數轉成 int

    空白欄位 → None
    """

    if value is None:
        return None

    value = str(value).strip()

    if value == "":
        return None

    return int(value)


def convert_escape_room(row, images):
    """
    將 Google Sheet 一列資料
    轉換成 API 使用的格式
    """

    # =========================
    # 密室名稱
    # =========================

    name = str(
        row.get("密室名稱", "")
    ).strip()


    # =========================
    # 玩家
    # =========================

    participants = {
        person: parse_bool(
            row.get(person, False)
        )
        for person in PARTICIPANTS
    }


    # =========================
    # Google Drive 圖片
    # =========================

    room_images = images.get(
        name,
        []
    )


    image_list = []

    for image in room_images:

        image_list.append(
            {
                "id": image["id"],
                "name": image["name"],
                "mime_type": image["mime_type"],

                "url": (
                    f"/api/escape-rooms/images/"
                    f"{image['id']}"
                ),
            }
        )


    # =========================
    # 回傳 API 資料
    # =========================

    return {
        "id": int(row["編號"]),

        "name": name,

        "company": str(
            row.get("工作室", "")
        ).strip(),

        # 多個日期使用半形逗號
        #
        # 例如：
        # 2024-01-01,2025-03-15
        #
        "date": str(
            row.get("遊玩日期", "")
        ).strip(),

        "location": str(
            row.get("地點", "")
        ).strip(),

        "min_players": parse_int(
            row.get("最少遊玩人數")
        ),

        "max_players": parse_int(
            row.get("最多遊玩人數")
        ),

        "participants": participants,

        # 多張圖片
        "images": image_list,
    }


def get_escape_rooms():
    """
    從 Google Sheets 取得所有密室資料，
    並整合 Google Drive 圖片。
    """

    worksheet = get_worksheet()


    # =========================
    # Google Sheets
    # =========================

    rows = worksheet.get_all_records()


    # =========================
    # Google Drive
    # =========================

    images = get_escape_room_images()


    # =========================
    # 整合資料
    # =========================

    return [
        convert_escape_room(
            row,
            images
        )
        for row in rows
    ]
