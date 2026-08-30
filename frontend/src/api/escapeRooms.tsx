import type { EscapeRoom } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getEscapeRooms(): Promise<EscapeRoom[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms`
  );

  if (!response.ok) {
    throw new Error("取得密室資料失敗");
  }

  return response.json();
}