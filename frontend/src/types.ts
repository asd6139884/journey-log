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


export interface EscapeRoom {
  id: number;

  name: string;

  company: string;

  // 多個日期以半形逗號分隔
  date: string;

  location: string;

  min_players: number | null;

  max_players: number | null;

  participants: Participants;

  // 改成多張圖片
  images: EscapeRoomImage[];
}

export interface EscapeRoomInput {
  name: string;

  company: string;

  // 多個日期以半形逗號分隔
  date: string;

  location: string;

  min_players: number | null;

  max_players: number | null;

  participants: Participants;
}