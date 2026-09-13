import os

import boto3
from botocore.client import Config
from dotenv import load_dotenv


# =========================
# 載入環境變數
# =========================

load_dotenv()


# =========================
# B2 設定
# =========================

B2_ENDPOINT = os.getenv("B2_ENDPOINT")
B2_REGION = os.getenv("B2_REGION")
B2_BUCKET = os.getenv("B2_BUCKET")
B2_KEY_ID = os.getenv("B2_KEY_ID")
B2_APPLICATION_KEY = os.getenv("B2_APPLICATION_KEY")


if not all([
    B2_ENDPOINT,
    B2_REGION,
    B2_BUCKET,
    B2_KEY_ID,
    B2_APPLICATION_KEY,
]):
    raise RuntimeError(
        "B2 environment variables are not fully configured"
    )


# =========================
# B2 Client
# =========================

b2_client = boto3.client(
    "s3",
    endpoint_url=B2_ENDPOINT,
    region_name=B2_REGION,
    aws_access_key_id=B2_KEY_ID,
    aws_secret_access_key=B2_APPLICATION_KEY,
    config=Config(signature_version="s3v4"),
)


# =========================
# Upload
# =========================

def upload_file(
    file_content: bytes,
    object_key: str,
    content_type: str,
) -> str:

    b2_client.put_object(
        Bucket=B2_BUCKET,
        Key=object_key,
        Body=file_content,
        ContentType=content_type,

        # ====================================
        # 圖片長期 Cache
        # UUID 檔名不會覆蓋
        # ====================================
        CacheControl=(
            "public, "
            "max-age=31536000, "
            "immutable"
        ),
    )

    return object_key


# =========================
# Delete
# =========================

def delete_file(
    object_key: str,
) -> None:

    b2_client.delete_object(
        Bucket=B2_BUCKET,
        Key=object_key,
    )








