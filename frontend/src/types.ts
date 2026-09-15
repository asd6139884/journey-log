export interface EscapeRoomImage {
  id: number;

  name: string;

  mime_type: string;

  object_key: string;

  image_url: string;

  created_at: string;
}


export interface Participants {
  智一: boolean;

  亞穎: boolean;

  仕瑄: boolean;

  燦為: boolean;

  品瑄: boolean;

  柏儒: boolean;

  董: boolean;

  明鴻: boolean;
}


/*
 * 工作室
 */
export interface Studio {
  id: number;

  name: string;

  created_at: string;
}


/*
 * 地點
 */
export interface Location {
  id: number;

  name: string;

  created_at: string;
}


/*
 * 密室
 */
export interface EscapeRoom {
  id: number;

  name: string;

  /*
   * 工作室
   *
   * studio_id 對應：
   * studios.id
   */
  studio_id: number | null;

  /*
   * 工作室名稱
   *
   * 由後端 JOIN studios 後回傳。
   */
  studio_name: string | null;

  /*
   * 一個密室可以有多個日期。
   *
   * 日期格式：
   * YYYY-MM-DD
   *
   * 例如：
   * [
   *   "2026-07-25",
   *   "2026-08-08"
   * ]
   */
  dates: string[];

  /*
   * 地點
   *
   * location_id 對應：
   * locations.id
   */
  location_id: number | null;

  /*
   * 地點名稱
   *
   * 由後端 JOIN locations 後回傳。
   */
  location_name: string | null;

  min_people: number | null;

  max_people: number | null;

  participants: Participants;

  images: EscapeRoomImage[];
}


/*
 * 新增 / 編輯密室時送給後端的資料
 */
export interface EscapeRoomInput {
  name: string;

  /*
   * 工作室 ID
   */
  studio_id: number | null;

  /*
   * 一個密室可以有多個日期。
   *
   * 日期格式：
   * YYYY-MM-DD
   */
  dates: string[];

  /*
   * 地點 ID
   */
  location_id: number | null;

  min_people: number | null;

  max_people: number | null;

  participants: Participants;
}