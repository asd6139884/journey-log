import { useState } from "react";

import type { EscapeRoom } from "../types";

import "./EscapeRoomCard.css";


interface EscapeRoomCardProps {
  room: EscapeRoom;
}


const API_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://journey-log-331i.onrender.com";


function EscapeRoomCard({
  room,
}: EscapeRoomCardProps) {

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);


  const images = room.images ?? [];

  const currentImage =
    images[currentImageIndex];


  const imageUrl = currentImage?.url
    ? currentImage.url.startsWith("http")
      ? currentImage.url
      : `${API_BASE_URL}${
          currentImage.url.startsWith("/")
            ? ""
            : "/"
        }${currentImage.url}`
    : null;


  // =========================
  // 上一張
  // =========================

  const handlePrevious = () => {

    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex((index) =>
      index === 0
        ? images.length - 1
        : index - 1
    );
  };


  // =========================
  // 下一張
  // =========================

  const handleNext = () => {

    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex((index) =>
      index === images.length - 1
        ? 0
        : index + 1
    );
  };


  return (
    <article className="escape-card">

      {/* =====================
          圖片
      ===================== */}

      <div className="escape-card-image">

        {imageUrl ? (

          <>

            <img
              key={currentImage?.id}
              src={imageUrl}
              alt={`${room.name} - ${
                currentImageIndex + 1
              }`}
              loading="lazy"
              decoding="async"
            />


            {/* 左右按鈕 */}

            {images.length > 1 && (

              <>

                <button
                  type="button"
                  onClick={handlePrevious}
                  aria-label="上一張圖片"
                  className="image-button image-button-left"
                >
                  ‹
                </button>


                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="下一張圖片"
                  className="image-button image-button-right"
                >
                  ›
                </button>


                {/* 圖片數量 */}

                <div className="image-counter">
                  {currentImageIndex + 1}
                  {" / "}
                  {images.length}
                </div>

              </>

            )}

          </>

        ) : (

          <div className="no-image">
            暫無圖片
          </div>

        )}

      </div>


      {/* =====================
          資料
      ===================== */}

      <div className="escape-card-content">

        <h2 className="escape-card-title">
          {room.name}
        </h2>


        <div className="escape-card-info">

          <p>
            <span>工作室</span>
            {room.company || "未記錄"}
          </p>

          <p>
            <span>遊玩日期</span>
            {room.date || "未記錄"}
          </p>

          <p>
            <span>地點</span>
            {room.location || "未記錄"}
          </p>

          <p>
            <span>遊玩人數</span>
            {room.min_players ?? "?"}
            {" ～ "}
            {room.max_players ?? "?"}
            {" 人"}
          </p>

        </div>


        {/* =====================
            玩家
        ===================== */}

        <div className="players">

          <strong>
            遊玩成員
          </strong>


          <div className="player-list">

            {Object.entries(
              room.participants ?? {}
            )
              .filter(
                ([, played]) => played
              )
              .map(([name]) => (

                <span
                  key={name}
                  className="player-tag"
                >
                  {name}
                </span>

              ))}

          </div>

        </div>

      </div>

    </article>
  );
}


export default EscapeRoomCard;
