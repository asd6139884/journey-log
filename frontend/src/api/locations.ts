import API_BASE_URL from "../config/api";
import type { Location } from "../types";
import { supabase } from "../lib/supabase";

async function getAccessToken(): Promise<string> {
  const {
    data: {
      session,
    },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error("取得登入 Session 失敗");
  }

  if (!session?.access_token) {
    throw new Error("目前尚未登入");
  }

  return session.access_token;
}

export async function getLocations(): Promise<Location[]> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/locations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("取得地點列表失敗");
  }

  return response.json();
}

export async function createLocation(
  name: string,
): Promise<Location> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/locations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("新增地點失敗");
  }

  return response.json();
}