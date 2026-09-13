from app.services.b2_storage import upload_file, delete_file


test_key = "test/test-image.txt"

content = b"Hello Backblaze B2!"

print("開始上傳...")

result = upload_file(
    file_content=content,
    object_key=test_key,
    content_type="text/plain",
)

print(f"上傳成功: {result}")


print("開始刪除...")

delete_file(test_key)

print("刪除成功")