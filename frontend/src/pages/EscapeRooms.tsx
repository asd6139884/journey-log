import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getEscapeRooms } from "../api/escapeRooms";
import type { EscapeRoom } from "../types";

import EscapeRoomCard from "../components/EscapeRoomCard";


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


function EscapeRooms() {
  const [rooms, setRooms] = useState<EscapeRoom[]>([]);
  const [selectedStudio, setSelectedStudio] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // 取得密室資料
  // =========================

  useEffect(() => {
    async function loadRooms() {
      try {
        console.log("開始取得密室資料");

        const data = await getEscapeRooms();

        console.log("API 回傳：", data);

        setRooms(data);
      } catch (error) {
        console.error("取得密室資料失敗：", error);

        setError("無法取得密室資料");
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);


  // =========================
  // 工作室清單
  // =========================

  const studios = useMemo(() => {
    const studioSet = new Set(
      rooms
        .map((room) => room.company)
        .filter((company) => company && company.trim() !== "")
    );

    return Array.from(studioSet).sort();
  }, [rooms]);


  // =========================
  // 根據工作室篩選
  // =========================

  const filteredRooms = useMemo(() => {
    if (selectedStudio === "全部") {
      return rooms;
    }

    return rooms.filter(
      (room) => room.company === selectedStudio
    );
  }, [rooms, selectedStudio]);


  // =========================
  // 每個人遊玩場數
  // =========================

  const playerStats = useMemo(() => {
    return PEOPLE.map((person) => {
      const count = filteredRooms.filter(
        (room) => room.participants?.[person] === true
      ).length;

      return {
        name: person,
        場數: count,
      };
    });
  }, [filteredRooms]);


  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <h1>密室逃脫</h1>
        <p>載入中...</p>
      </main>
    );
  }


  // =========================
  // Error
  // =========================

  if (error) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <h1>密室逃脫</h1>

        <p style={{ color: "red" }}>
          {error}
        </p>
      </main>
    );
  }


  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      {/* =========================
          標題
      ========================= */}

      <h1>密室逃脫</h1>


      {/* =========================
          工作室篩選
      ========================= */}

      <section
        style={{
          marginTop: "24px",
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <label
          htmlFor="studio-filter"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
          }}
        >
          工作室
        </label>

        <select
          id="studio-filter"
          value={selectedStudio}
          onChange={(event) =>
            setSelectedStudio(event.target.value)
          }
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            minWidth: "240px",
            fontSize: "16px",
          }}
        >
          <option value="全部">
            全部工作室
          </option>

          {studios.map((studio) => (
            <option
              key={studio}
              value={studio}
            >
              {studio}
            </option>
          ))}
        </select>
      </section>


      {/* =========================
          統計摘要
      ========================= */}

      <section
        style={{
          marginBottom: "40px",
        }}
      >
        <h2>遊玩統計</h2>

        <p>
          {selectedStudio === "全部"
            ? "全部工作室"
            : selectedStudio}
          {"　"}
          共 {filteredRooms.length} 個主題
        </p>


        {/* 每個人遊玩場數 */}

        <div
          style={{
            width: "100%",
            height: "400px",
            marginTop: "24px",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={playerStats}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
              />

              <YAxis
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="場數"
                name="遊玩場數"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>


      {/* =========================
          各主題遊玩紀錄
      ========================= */}

      <section
        style={{
          marginBottom: "50px",
        }}
      >
        <h2>各主題遊玩紀錄</h2>

        <div
          style={{
            overflowX: "auto",
            marginTop: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "900px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    whiteSpace: "nowrap",
                  }}
                >
                  密室名稱
                </th>

                {PEOPLE.map((person) => (
                  <th
                    key={person}
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "1px solid #ddd",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {person}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {room.name}
                  </td>

                  {PEOPLE.map((person) => {
                    const played =
                      room.participants?.[person] === true;

                    return (
                      <td
                        key={person}
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          borderBottom: "1px solid #eee",
                          fontSize: "20px",
                        }}
                      >
                        {played ? "✓" : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {filteredRooms.length === 0 && (
                <tr>
                  <td
                    colSpan={PEOPLE.length + 1}
                    style={{
                      padding: "30px",
                      textAlign: "center",
                    }}
                  >
                    此工作室目前沒有密室資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


      {/* =========================
          密室列表
      ========================= */}

      <section>
        <h2>密室列表</h2>

        <p>
          共 {filteredRooms.length} 間
        </p>

        {filteredRooms.length === 0 ? (
          <p>目前沒有密室資料</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            {filteredRooms.map((room) => (
              <EscapeRoomCard
                key={room.id}
                room={room}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


export default EscapeRooms;

