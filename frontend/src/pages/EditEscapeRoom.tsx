import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  deleteEscapeRoomImage,
  getEscapeRoom,
  updateEscapeRoom,
  uploadEscapeRoomImage,
} from "../api/escapeRooms";

import type {
  EscapeRoom,
  EscapeRoomInput,
  Participants,
} from "../types";

import "./EscapeRoomForm.css";

const PEOPLE: Array<keyof Participants> = [
  "智一",
  "亞穎",
  "仕瑄",
  "燦為",
  "品瑄",
  "柏儒",
  "董",
  "明鴻",
];

function EditEscapeRoom() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [room, setRoom] =
    useState<EscapeRoom | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deletingImageId, setDeletingImageId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  // =========================
  // 取得密室資料
  // =========================

  useEffect(() => {
    async function loadRoom() {
      if (!id) {
        setError("找不到密室 ID");
        setLoading(false);
        return;
      }

      const roomId = Number(id);

      if (!Number.isInteger(roomId)) {
        setError("密室 ID 無效");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getEscapeRoom(roomId);

        setRoom(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("取得密室資料失敗");
        }
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [id]);

  // =========================
  // 更新基本欄位
  // =========================

  function updateField(
    field: keyof EscapeRoomInput,
    value: string | number | null,
  ) {
    if (!room) {
      return;
    }

    setRoom({
      ...room,
      [field]: value,
    });
  }

  // =========================
  // 更新參加者
  // =========================

  function updateParticipant(
    name: keyof Participants,
    value: boolean,
  ) {
    if (!room) {
      return;
    }

    setRoom({
      ...room,

      participants: {
        ...room.participants,
        [name]: value,
      },
    });
  }

  // =========================
  // 新增圖片
  // =========================

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!room) {
      return;
    }

    const files = Array.from(
      event.target.files ?? [],
    );

    if (files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 依序上傳
      for (const file of files) {
        const uploadedImage =
          await uploadEscapeRoomImage(
            room.id,
            file,
          );

        setRoom((currentRoom) => {
          if (!currentRoom) {
            return currentRoom;
          }

          return {
            ...currentRoom,

            images: [
              ...(currentRoom.images ?? []),
              uploadedImage,
            ],
          };
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("圖片上傳失敗");
      }
    } finally {
      setUploading(false);

      // 允許再次選擇同一張圖片
      event.target.value = "";
    }
  }

  // =========================
  // 刪除圖片
  // =========================

  async function handleDeleteImage(
    imageId: number,
    imageName: string,
  ) {
    if (!room) {
      return;
    }

    const confirmed = window.confirm(
      `確定要刪除圖片「${imageName}」嗎？\n\n` +
        "刪除後無法復原。",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingImageId(imageId);
      setError(null);

      await deleteEscapeRoomImage(
        room.id,
        imageId,
      );

      setRoom((currentRoom) => {
        if (!currentRoom) {
          return currentRoom;
        }

        return {
          ...currentRoom,

          images: (
            currentRoom.images ?? []
          ).filter(
            (image) =>
              image.id !== imageId,
          ),
        };
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("圖片刪除失敗");
      }
    } finally {
      setDeletingImageId(null);
    }
  }

  // =========================
  // 儲存
  // =========================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!room) {
      return;
    }

    if (!room.name.trim()) {
      setError("請輸入密室名稱");
      return;
    }

    if (
      room.min_players !== null &&
      room.max_players !== null &&
      room.min_players > room.max_players
    ) {
      setError("最少人數不能大於最多人數");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data: EscapeRoomInput = {
        name: room.name,
        company: room.company,
        date: room.date,
        location: room.location,
        min_players: room.min_players,
        max_players: room.max_players,
        participants: room.participants,
      };

      await updateEscapeRoom(
        room.id,
        data,
      );

      navigate("/escape-rooms");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("更新密室失敗");
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="escape-room-form-page">
        載入密室資料中...
      </div>
    );
  }

  // =========================
  // 找不到資料
  // =========================

  if (!room) {
    return (
      <div className="escape-room-form-page">
        <p className="escape-room-form-error">
          {error ?? "找不到密室資料"}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/escape-rooms")
          }
        >
          返回密室列表
        </button>
      </div>
    );
  }

  const images = room.images ?? [];

  return (
    <div className="escape-room-form-page">
      <h1>編輯密室</h1>

      {error && (
        <p className="escape-room-form-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* =========================
            基本資料
        ========================= */}

        <div className="escape-room-field">
          <label htmlFor="name">
            密室名稱
          </label>

          <input
            id="name"
            type="text"
            value={room.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value,
              )
            }
          />
        </div>

        <div className="escape-room-field">
          <label htmlFor="company">
            工作室
          </label>

          <input
            id="company"
            type="text"
            value={room.company}
            onChange={(event) =>
              updateField(
                "company",
                event.target.value,
              )
            }
          />
        </div>

        <div className="escape-room-field">
          <label htmlFor="date">
            日期
          </label>

          <input
            id="date"
            type="text"
            value={room.date}
            placeholder="例如：2026.08.01"
            onChange={(event) =>
              updateField(
                "date",
                event.target.value,
              )
            }
          />
        </div>

        <div className="escape-room-field">
          <label htmlFor="location">
            地點
          </label>

          <input
            id="location"
            type="text"
            value={room.location}
            onChange={(event) =>
              updateField(
                "location",
                event.target.value,
              )
            }
          />
        </div>

        {/* =========================
            人數
        ========================= */}

        <div className="escape-room-field">
          <label htmlFor="min_players">
            最少人數
          </label>

          <input
            id="min_players"
            type="number"
            min="1"
            value={
              room.min_players ?? ""
            }
            onChange={(event) =>
              updateField(
                "min_players",
                event.target.value === ""
                  ? null
                  : Number(
                      event.target.value,
                    ),
              )
            }
          />
        </div>

        <div className="escape-room-field">
          <label htmlFor="max_players">
            最多人數
          </label>

          <input
            id="max_players"
            type="number"
            min="1"
            value={
              room.max_players ?? ""
            }
            onChange={(event) =>
              updateField(
                "max_players",
                event.target.value === ""
                  ? null
                  : Number(
                      event.target.value,
                    ),
              )
            }
          />
        </div>

        {/* =========================
            參加者
        ========================= */}

        <section className="escape-room-participants">
          <h2>參加者</h2>

          <div className="participant-list">
            {PEOPLE.map((name) => (
              <label
                key={name}
                className="participant-item"
              >
                <input
                  type="checkbox"
                  checked={
                    room.participants[name]
                  }
                  onChange={(event) =>
                    updateParticipant(
                      name,
                      event.target.checked,
                    )
                  }
                />

                <span>{name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* =========================
            圖片
        ========================= */}

        <section className="escape-room-images-section">
          <div className="escape-room-images-header">
            <div>
              <h2>圖片</h2>

              <p>
                目前共有 {images.length} 張圖片
              </p>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="escape-room-images-grid">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="escape-room-image-item"
                >
                  <div className="escape-room-image-preview">
                    <img
                      src={image.image_url}
                      alt={
                        image.name ||
                        `${room.name} 圖片`
                      }
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="escape-room-image-info">
                    <span
                      className="escape-room-image-name"
                      title={image.name}
                    >
                      {image.name}
                    </span>

                    <button
                      type="button"
                      className="delete-image-button"
                      onClick={() =>
                        handleDeleteImage(
                          image.id,
                          image.name,
                        )
                      }
                      disabled={
                        uploading ||
                        saving ||
                        deletingImageId ===
                          image.id
                      }
                    >
                      {deletingImageId ===
                      image.id
                        ? "刪除中..."
                        : "刪除"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-escape-room-images">
              目前沒有圖片
            </div>
          )}

          {/* =========================
              新增圖片
          ========================= */}

          <div className="upload-images-box">
            <label
              htmlFor="edit-image-upload"
              className="upload-images-button"
            >
              {uploading
                ? "圖片上傳中..."
                : "＋ 新增圖片"}
            </label>

            <input
              id="edit-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              onChange={handleImageUpload}
              disabled={
                uploading ||
                saving ||
                deletingImageId !== null
              }
              hidden
            />

            <p>
              可一次選擇多張圖片
            </p>
          </div>
        </section>

        {/* =========================
            操作
        ========================= */}

        <div className="escape-room-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/escape-rooms")
            }
            disabled={
              saving ||
              uploading ||
              deletingImageId !== null
            }
          >
            取消
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              uploading ||
              deletingImageId !== null
            }
          >
            {saving
              ? "儲存中..."
              : "儲存"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEscapeRoom;