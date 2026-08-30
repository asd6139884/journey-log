import json
import os

from dotenv import load_dotenv
from google.oauth2.service_account import Credentials


load_dotenv()


def get_google_credentials(scopes):
    """
    取得 Google Service Account Credentials。

    本機：
        使用 GOOGLE_SERVICE_ACCOUNT_FILE

    Render：
        使用 GOOGLE_SERVICE_ACCOUNT_JSON
    """

    # ========================================
    # Render / 雲端環境
    # ========================================

    credentials_json = os.getenv(
        "GOOGLE_SERVICE_ACCOUNT_JSON"
    )

    if credentials_json:
        try:
            credentials_info = json.loads(
                credentials_json
            )
        except json.JSONDecodeError as e:
            raise RuntimeError(
                "GOOGLE_SERVICE_ACCOUNT_JSON 格式錯誤"
            ) from e

        return Credentials.from_service_account_info(
            credentials_info,
            scopes=scopes,
        )

    # ========================================
    # 本機開發
    # ========================================

    credentials_file = os.getenv(
        "GOOGLE_SERVICE_ACCOUNT_FILE"
    )

    if not credentials_file:
        raise RuntimeError(
            "找不到 Google Service Account 設定。"
            "請設定 GOOGLE_SERVICE_ACCOUNT_FILE "
            "或 GOOGLE_SERVICE_ACCOUNT_JSON。"
        )

    return Credentials.from_service_account_file(
        credentials_file,
        scopes=scopes,
    )