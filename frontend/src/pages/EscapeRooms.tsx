import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  deleteEscapeRoom,
  getEscapeRooms,
} from "../api/escapeRooms";

import {
  useAuth,
} from "../auth/AuthContext";

import type { EscapeRoom } from "../types";

import EscapeRoomCard from "../components/EscapeRoomCard";

import "./EscapeRooms.css";


/* ==================================================
   玩家名單
   ================================================== */

const PEOPLE = [
  "智一",
  "亞穎",
  "仕瑄",
  "燦為",
  "品瑄",
  "柏儒",
  "董",
  "明鴻",
] as const;


/* ==================================================
   Escape Rooms
   ================================================== */

function EscapeRooms() {
  const navigate = useNavigate();

  const {
    hasPermission,
  } = useAuth();


  /* ==================================================
     Permission
     ================================================== */

  const canEdit =
    hasPermission(
      "escape_room_edit",
    );


  /* ==================================================
     State
     ================================================== */

  const [rooms, setRooms] =
    useState<EscapeRoom[]>([]);

  const [selectedStudio, setSelectedStudio] =
    useState("全部");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ==================================================
     取得密室資料
     ================================================== */

  useEffect(() => {
    async function loadRooms() {
      try {
        console.log(
          "開始取得密室資料",
        );

        const data =
          await getEscapeRooms();

        console.log(
          "API 回傳：",
          data,
        );

        setRooms(data);

      } catch (err) {
        console.error(
          "取得密室資料失敗：",
          err,
        );

        setError(
          "無法取得密室資料",
        );

      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);


  /* ==================================================
     刪除密室
     ================================================== */

  async function handleDeleteRoom(
    roomId: number,
  ) {
    try {
      setError("");

      await deleteEscapeRoom(
        roomId,
      );

      setRooms(
        (currentRooms) =>
          currentRooms.filter(
            (room) =>
              room.id !== roomId,
          ),
      );

    } catch (err) {
      console.error(
        "刪除密室失敗：",
        err,
      );

      setError(
        "刪除密室失敗",
      );

      throw err;
    }
  }


  /* ==================================================
     工作室清單
     ================================================== */

  const studios = useMemo(() => {
    const studioSet = new Set(
      rooms
        .map(
          (room) =>
            room.company,
        )
        .filter(
          (company) =>
            company &&
            company.trim() !== "",
        ),
    );

    return Array.from(
      studioSet,
    ).sort();
  }, [rooms]);


  /* ==================================================
     篩選密室
     ================================================== */

  const filteredRooms = useMemo(() => {
    if (
      selectedStudio === "全部"
    ) {
      return rooms;
    }

    return rooms.filter(
      (room) =>
        room.company ===
        selectedStudio,
    );
  }, [
    rooms,
    selectedStudio,
  ]);


  /* ==================================================
     遊玩統計
     ================================================== */

  const playerStats = useMemo(() => {
    return PEOPLE.map(
      (person) => {
        const count =
          filteredRooms.filter(
            (room) =>
              room.participants?.[
                person
              ] === true,
          ).length;

        return {
          name: person,
          場數: count,
        };
      },
    );
  }, [filteredRooms]);


  /* ==================================================
     Loading
     ================================================== */

  if (loading) {
    return (
      <main className="escape-page">
        <h1>密室逃脫</h1>

        <div className="status-message">
          載入中...
        </div>
      </main>
    );
  }


  /* ==================================================
     Error
     ================================================== */

  if (error) {
    return (
      <main className="escape-page">
        <h1>密室逃脫</h1>

        <div className="error-message">
          {error}
        </div>
      </main>
    );
  }


  /* ==================================================
     Render
     ================================================== */

  return (
    <main className="escape-page">

      {/* ==================================================
          Header
          ================================================== */}

      <header className="escape-header">
        <div>
          <h1>密室逃脫</h1>

          <p>
            共 {filteredRooms.length} 間密室
          </p>
        </div>
      </header>


      {/* ==================================================
          工作室篩選
          ================================================== */}

      <section className="filter-section">

        <label
          htmlFor="studio-filter"
          className="filter-label"
        >
          工作室
        </label>

        <select
          id="studio-filter"
          value={selectedStudio}
          onChange={(event) =>
            setSelectedStudio(
              event.target.value,
            )
          }
          className="studio-select"
        >
          <option value="全部">
            全部工作室
          </option>

          {studios.map(
            (studio) => (
              <option
                key={studio}
                value={studio}
              >
                {studio}
              </option>
            ),
          )}
        </select>

      </section>


      {/* ==================================================
          遊玩統計
          ================================================== */}

      <section className="stats-section">

        <div className="section-title">

          <div>
            <h2>遊玩統計</h2>

            <p>
              {selectedStudio ===
              "全部"
                ? "全部工作室"
                : selectedStudio}
            </p>
          </div>

          <div className="room-count">
            {filteredRooms.length} 個主題
          </div>

        </div>


        <div className="chart-container">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={playerStats}
              margin={{
                top: 20,
                right: 12,
                left: -8,
                bottom: 8,
              }}
              barCategoryGap="24%"
            >

              <CartesianGrid
                vertical={false}
                stroke="#eeeeee"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{
                  fontSize: 13,
                  fill: "#666",
                }}
              />

              <YAxis
                allowDecimals={false}
                width={32}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{
                  fontSize: 12,
                  fill: "#999",
                }}
              />

              <Tooltip
                cursor={{
                  fill:
                    "rgba(0, 0, 0, 0.03)",
                }}
                contentStyle={{
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#fff",
                  boxShadow:
                    "0 4px 12px rgba(0, 0, 0, 0.08)",
                  padding: "10px 12px",
                }}
                labelStyle={{
                  marginBottom: "4px",
                  color: "#333",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: "#555",
                  fontSize: "13px",
                }}
                formatter={(value) => [
                  `${value ?? 0} 場`,
                  "遊玩次數",
                ]}
              />

              <Bar
                dataKey="場數"
                name="遊玩次數"
                fill="#333"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={42}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>

      </section>


      {/* ==================================================
          各主題遊玩紀錄
          ================================================== */}

      <section className="records-section">

        <div className="section-title">

          <div>
            <h2>
              各主題遊玩紀錄
            </h2>

            <p>
              顯示每個人的遊玩紀錄
            </p>
          </div>

        </div>


        <div className="table-wrapper">

          <table className="records-table">

            <thead>
              <tr>

                <th className="room-name-column">
                  密室名稱
                </th>

                {PEOPLE.map(
                  (person) => (
                    <th key={person}>
                      {person}
                    </th>
                  ),
                )}

              </tr>
            </thead>


            <tbody>

              {filteredRooms.map(
                (room) => (
                  <tr key={room.id}>

                    <td className="room-name-cell">
                      {room.name}
                    </td>

                    {PEOPLE.map(
                      (person) => {
                        const played =
                          room.participants?.[
                            person
                          ] === true;

                        return (
                          <td
                            key={person}
                            className={
                              played
                                ? "played-cell"
                                : "not-played-cell"
                            }
                          >
                            {played
                              ? "✓"
                              : "—"}
                          </td>
                        );
                      },
                    )}

                  </tr>
                ),
              )}


              {filteredRooms.length ===
                0 && (
                <tr>

                  <td
                    colSpan={
                      PEOPLE.length + 1
                    }
                    className="empty-table"
                  >
                    此工作室目前沒有密室資料
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>


        <div className="table-hint">
          ← 左右滑動查看完整紀錄 →
        </div>

      </section>


      {/* ==================================================
          密室列表
          ================================================== */}

      <section className="rooms-section">

        <div className="section-title">

          <div>
            <h2>密室列表</h2>

            <p>
              共 {filteredRooms.length} 間
            </p>
          </div>


          {/* ==================================
              只有 edit 權限才顯示新增
              ================================== */}

          {canEdit && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/escape-rooms/new",
                )
              }
            >
              ＋ 新增密室
            </button>
          )}

        </div>


        {filteredRooms.length === 0 ? (

          <div className="empty-message">
            目前沒有密室資料
          </div>

        ) : (

          <div className="rooms-grid">

            {filteredRooms.map(
              (room) => (
                <EscapeRoomCard
                  key={room.id}
                  room={room}
                  onDelete={
                    handleDeleteRoom
                  }
                />
              ),
            )}

          </div>

        )}

      </section>

    </main>
  );
}


export default EscapeRooms;