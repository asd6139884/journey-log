import type {
  EscapeRoom,
  EscapeRoomInput,
} from "../types";

import { supabase } from "../lib/supabase";
import API_BASE_URL from "../config/api";


// ==================================================
// 取得目前登入者 Access Token
// ==================================================

async function getAccessToken(): Promise<string> {
  const {
    data: {
      session,
    },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(
      "取得登入 Session 失敗",
    );
  }

  if (!session?.access_token) {
    throw new Error(
      "目前尚未登入",
    );
  }

  return session.access_token;
}


// ==================================================
// 建立 Authorization Header
// ==================================================

async function getAuthHeaders(): Promise<
  Record<string, string>
> {
  const accessToken =
    await getAccessToken();

  return {
    Authorization:
      `Bearer ${accessToken}`,
  };
}


// ==================================================
// 取得所有密室
// ==================================================

export async function getEscapeRooms(): Promise<EscapeRoom[]> {
  const headers =
    await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    let message =
      "取得密室資料失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }

  return response.json();
}


// ==================================================
// 取得單一密室
// ==================================================

export async function getEscapeRoom(
  roomId: number,
): Promise<EscapeRoom> {

  const headers =
    await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms/${roomId}`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    let message =
      "取得密室資料失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }

  return response.json();
}


// ==================================================
// 新增密室
// ==================================================

export async function createEscapeRoom(
  data: EscapeRoomInput,
): Promise<EscapeRoom> {

  const headers =
    await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms`,
    {
      method: "POST",

      headers: {
        ...headers,
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    let message =
      "新增密室失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }

  return response.json();
}


// ==================================================
// 編輯密室
// ==================================================

export async function updateEscapeRoom(
  roomId: number,
  data: EscapeRoomInput,
): Promise<EscapeRoom> {

  const headers =
    await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms/${roomId}`,
    {
      method: "PUT",

      headers: {
        ...headers,
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    let message =
      "更新密室失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }

  return response.json();
}


// ==================================================
// 刪除密室
// ==================================================

export async function deleteEscapeRoom(
  roomId: number,
): Promise<void> {

  const headers =
    await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms/${roomId}`,
    {
      method: "DELETE",
      headers,
    },
  );

  if (!response.ok) {
    let message =
      "刪除密室失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }
}


// ==================================================
// 上傳密室圖片
// ==================================================

export async function uploadEscapeRoomImage(
  roomId: number,
  file: File,
) {

  const accessToken =
    await getAccessToken();

  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms/${roomId}/images`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: formData,
    },
  );

  if (!response.ok) {
    let message =
      "圖片上傳失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }

  return response.json();
}


// ==================================================
// 刪除密室圖片
// ==================================================

export async function deleteEscapeRoomImage(
  roomId: number,
  imageId: number,
): Promise<void> {

  const headers =
    await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/escape-rooms/${roomId}/images/${imageId}`,
    {
      method: "DELETE",
      headers,
    },
  );

  if (!response.ok) {
    let message =
      "刪除圖片失敗";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // 使用預設錯誤訊息
    }

    throw new Error(message);
  }
}