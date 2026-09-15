import API_BASE_URL from "../config/api";
import type { Studio } from "../types";
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

export async function getStudios(): Promise<Studio[]> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/studios`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("取得工作室列表失敗");
  }

  return response.json();
}

export async function createStudio(
  name: string,
): Promise<Studio> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/studios`,
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
    throw new Error("新增工作室失敗");
  }

  return response.json();
}