export interface EscapeRoomImage {
  id: string;
  name: string;
  mimeType: string;
  url: string;
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

