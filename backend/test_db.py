from sqlalchemy import select

from app.database import SessionLocal
from app.models import EscapeRoom


try:
    with SessionLocal() as db:
        rooms = db.scalars(
            select(EscapeRoom).order_by(EscapeRoom.id)
        ).all()

        print("✅ Supabase 資料庫連線成功！")
        print(f"📦 escape_rooms 共有 {len(rooms)} 筆資料")

        for room in rooms:
            print()
            print(f"id: {room.id}")
            print(f"name: {room.name}")
            print(f"studio: {room.studio}")
            print(f"zdates: {room.dates}")
            print(f"location: {room.location}")
            print(f"people: {room.min_people} - {room.max_people}")

except Exception as e:
    print("❌ 讀取 escape_rooms 失敗")
    print(type(e).__name__)
    print(e)