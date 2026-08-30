import { useState } from "react";

import type { EscapeRoom } from "../types";


interface EscapeRoomCardProps {
  room: EscapeRoom;
}


const API_BASE_URL = "http://127.0.0.1:8000";


function EscapeRoomCard({
  room,
}: EscapeRoomCardProps) {

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);


  const images = room.images ?? [];


  const currentImage =
    images[currentImageIndex];


  const imageUrl = currentImage
    ? `${API_BASE_URL}${currentImage.url}`
    : null;


  // =========================
  // 上一張
  // =========================

  const handlePrevious = () => {

    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex((index) => {

      if (index === 0) {
        return images.length - 1;
      }

      return index - 1;
    });
  };


  // =========================
  // 下一張
  // =========================

  const handleNext = () => {

    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex((index) => {

      if (index === images.length - 1) {
        return 0;
      }

      return index + 1;
    });
  };


  return (
    <article
      style={{
        overflow: "hidden",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >

      {/* =====================
          圖片
      ===================== */}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "200px",
          backgroundColor: "#f2f2f2",
        }}
      >

        {imageUrl ? (

          <>
            <img
              key={currentImage.id}
              src={imageUrl}
              alt={`${room.name} - ${currentImageIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />


            {/* =================
                左右切換
            ================= */}

            {images.length > 1 && (

              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  aria-label="上一張圖片"
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",

                    width: "36px",
                    height: "36px",

                    border: "none",
                    borderRadius: "50%",

                    backgroundColor:
                      "rgba(0, 0, 0, 0.5)",

                    color: "#fff",

                    fontSize: "24px",

                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>


                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="下一張圖片"
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",

                    width: "36px",
                    height: "36px",

                    border: "none",
                    borderRadius: "50%",

                    backgroundColor:
                      "rgba(0, 0, 0, 0.5)",

                    color: "#fff",

                    fontSize: "24px",

                    cursor: "pointer",
                  }}
                >
                  ›
                </button>


                {/* 圖片數量 */}

                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    bottom: "10px",

                    padding: "4px 8px",

                    borderRadius: "6px",

                    backgroundColor:
                      "rgba(0, 0, 0, 0.6)",

                    color: "#fff",

                    fontSize: "12px",
                  }}
                >
                  {currentImageIndex + 1}
                  {" / "}
                  {images.length}
                </div>
              </>

            )}

          </>

        ) : (

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              width: "100%",
              height: "100%",

              color: "#888",
            }}
          >
            暫無圖片
          </div>

        )}

      </div>


      {/* =====================
          資料
      ===================== */}

      <div
        style={{
          padding: "16px",
        }}
      >

        <h2
          style={{
            marginTop: 0,
          }}
        >
          {room.name}
        </h2>


        <p>
          工作室：
          {room.company}
        </p>


        <p>
          遊玩日期：
          {room.date || "未記錄"}
        </p>


        <p>
          地點：
          {room.location}
        </p>


        <p>
          遊玩人數：
          {room.min_players ?? "?"}
          {" ～ "}
          {room.max_players ?? "?"}
          {" 人"}
        </p>


        {/* =====================
            玩家
        ===================== */}

        <div>

          <strong>
            遊玩成員：
          </strong>


          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px",
            }}
          >

            {Object.entries(
              room.participants
            )
              .filter(
                ([, played]) => played
              )
              .map(
                ([name]) => (

                  <span
                    key={name}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",

                      backgroundColor:
                        "#eee",

                      fontSize: "14px",
                    }}
                  >
                    {name}
                  </span>

                )
              )}

          </div>

        </div>

      </div>

    </article>
  );
}


export default EscapeRoomCard;
