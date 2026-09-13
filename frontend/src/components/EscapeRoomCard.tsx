import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/AuthContext";

import type {
  EscapeRoom,
} from "../types";

import "./EscapeRoomCard.css";


interface EscapeRoomCardProps {
  room: EscapeRoom;

  onDelete: (
    roomId: number,
  ) => Promise<void>;
}


function EscapeRoomCard({
  room,
  onDelete,
}: EscapeRoomCardProps) {
  const navigate =
    useNavigate();

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

  const [
    currentImageIndex,
    setCurrentImageIndex,
  ] = useState(0);

  const [
    deleting,
    setDeleting,
  ] = useState(false);


  /* ==================================================
     Images
     ================================================== */

  const images =
    room.images ?? [];

  const currentImage =
    images[
      currentImageIndex
    ];

  const imageUrl =
    currentImage?.image_url ??
    null;


  /* ==================================================
     上一張
     ================================================== */

  const handlePrevious = () => {
    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex(
      (index) =>
        index === 0
          ? images.length - 1
          : index - 1,
    );
  };


  /* ==================================================
     下一張
     ================================================== */

  const handleNext = () => {
    if (images.length <= 1) {
      return;
    }

    setCurrentImageIndex(
      (index) =>
        index ===
        images.length - 1
          ? 0
          : index + 1,
    );
  };


  /* ==================================================
     刪除
     ================================================== */

  const handleDelete =
    async () => {
      const confirmed =
        window.confirm(
          `確定要刪除「${room.name}」嗎？\n\n` +
            "刪除後密室資料與圖片都會被刪除，無法復原。",
        );


      if (!confirmed) {
        return;
      }


      try {
        setDeleting(true);

        await onDelete(
          room.id,
        );

      } catch {
        // 錯誤由父層處理

      } finally {
        setDeleting(false);
      }
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
              loading={
                currentImageIndex === 0
                  ? "eager"
                  : "lazy"
              }
              decoding="async"
              fetchPriority={
                currentImageIndex === 0
                  ? "high"
                  : "auto"
              }
            />


            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  aria-label="上一張圖片"
                  className="image-button image-button-left"
                  disabled={deleting}
                >
                  ‹
                </button>


                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  aria-label="下一張圖片"
                  className="image-button image-button-right"
                  disabled={deleting}
                >
                  ›
                </button>


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


        {/* =====================
            密室資料
        ===================== */}

        <div className="escape-card-info">

          <p>
            <span>工作室</span>
            {room.company ||
              "未記錄"}
          </p>

          <p>
            <span>遊玩日期</span>
            {room.date ||
              "未記錄"}
          </p>

          <p>
            <span>地點</span>
            {room.location ||
              "未記錄"}
          </p>

          <p>
            <span>遊玩人數</span>
            {room.min_players ??
              "?"}
            {" ～ "}
            {room.max_players ??
              "?"}
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
              room.participants ?? {},
            )
              .filter(
                ([, played]) =>
                  played,
              )
              .map(
                ([name]) => (
                  <span
                    key={name}
                    className="player-tag"
                  >
                    {name}
                  </span>
                ),
              )}

          </div>

        </div>


        {/* =====================
            操作
            只有 edit 權限顯示
        ===================== */}

        {canEdit && (
          <div className="escape-card-actions">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/escape-rooms/${room.id}/edit`,
                )
              }
              className="edit-room-button"
              disabled={deleting}
            >
              編輯
            </button>


            <button
              type="button"
              onClick={
                handleDelete
              }
              className="delete-room-button"
              disabled={deleting}
            >
              {deleting
                ? "刪除中..."
                : "刪除"}
            </button>

          </div>
        )}

      </div>

    </article>
  );
}


export default EscapeRoomCard;