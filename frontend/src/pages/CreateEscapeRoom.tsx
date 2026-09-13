import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createEscapeRoom,
  uploadEscapeRoomImage,
} from "../api/escapeRooms";

import type {
  EscapeRoomInput,
  Participants,
} from "../types";

import "./EscapeRoomForm.css";


const PEOPLE: Array<
  keyof Participants
> = [
  "智一",
  "亞穎",
  "仕瑄",
  "燦為",
  "品瑄",
  "柏儒",
  "董",
  "明鴻",
];


const initialParticipants:
  Participants = {
    智一: false,
    亞穎: false,
    仕瑄: false,
    燦為: false,
    品瑄: false,
    柏儒: false,
    董: false,
    明鴻: false,
  };


function CreateEscapeRoom() {
  const navigate =
    useNavigate();


  /* ==================================================
     State
     ================================================== */

  const [form, setForm] =
    useState<EscapeRoomInput>({
      name: "",
      company: "",
      date: "",
      location: "",
      min_players: null,
      max_players: null,
      participants:
        initialParticipants,
    });


  const [images, setImages] =
    useState<File[]>([]);


  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);


  const [saving, setSaving] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  /* ==================================================
     建立圖片 Preview
     ================================================== */

  useEffect(() => {
    const urls = images.map(
      (file) =>
        URL.createObjectURL(file),
    );

    setImagePreviews(urls);


    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images]);


  /* ==================================================
     更新文字 / 數字欄位
     ================================================== */

  function updateField(
    field: keyof EscapeRoomInput,
    value:
      | string
      | number
      | null,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    );
  }


  /* ==================================================
     更新參加者
     ================================================== */

  function updateParticipant(
    name: keyof Participants,
    value: boolean,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,

        participants: {
          ...currentForm.participants,

          [name]: value,
        },
      }),
    );
  }


  /* ==================================================
     選擇圖片
     ================================================== */

  function handleImageSelect(
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ?? [],
      );


    if (
      selectedFiles.length === 0
    ) {
      return;
    }


    setImages(
      (currentImages) => [
        ...currentImages,
        ...selectedFiles,
      ],
    );


    event.target.value = "";
  }


  /* ==================================================
     移除尚未上傳的圖片
     ================================================== */

  function handleRemoveImage(
    index: number,
  ) {
    setImages(
      (currentImages) =>
        currentImages.filter(
          (_, imageIndex) =>
            imageIndex !== index,
        ),
    );
  }


  /* ==================================================
     建立密室
     ================================================== */

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    if (!form.name.trim()) {
      setError(
        "請輸入密室名稱",
      );

      return;
    }


    if (
      form.min_players !==
        null &&
      form.max_players !==
        null &&
      form.min_players >
        form.max_players
    ) {
      setError(
        "最少人數不能大於最多人數",
      );

      return;
    }


    try {
      setSaving(true);
      setError(null);


      // ====================================
      // 1. 建立密室
      // ====================================

      const createdRoom =
        await createEscapeRoom(
          form,
        );


      // ====================================
      // 2. 上傳圖片
      // ====================================

      for (
        const file of images
      ) {
        await uploadEscapeRoomImage(
          createdRoom.id,
          file,
        );
      }


      // ====================================
      // 3. 回到列表
      // ====================================

      navigate(
        "/escape-rooms",
      );

    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message,
        );
      } else {
        setError(
          "建立密室失敗",
        );
      }

    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="escape-room-form-page">

      <h1>新增密室</h1>


      {error && (
        <p className="escape-room-form-error">
          {error}
        </p>
      )}


      <form
        onSubmit={
          handleSubmit
        }
      >

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
            value={form.name}
            placeholder="例如：哈梅爾寺"
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
            value={
              form.company
            }
            placeholder="例如：草咩咩遊戲工作室"
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
            value={form.date}
            placeholder="例如：2026.07.25"
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
            value={
              form.location
            }
            placeholder="例如：台中"
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
              form.min_players ??
              ""
            }
            onChange={(event) =>
              updateField(
                "min_players",
                event.target.value ===
                  ""
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
              form.max_players ??
              ""
            }
            onChange={(event) =>
              updateField(
                "max_players",
                event.target.value ===
                  ""
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

            {PEOPLE.map(
              (name) => (
                <label
                  key={name}
                  className="participant-item"
                >

                  <input
                    type="checkbox"
                    checked={
                      form.participants[
                        name
                      ]
                    }
                    onChange={(
                      event,
                    ) =>
                      updateParticipant(
                        name,
                        event.target
                          .checked,
                      )
                    }
                  />

                  <span>
                    {name}
                  </span>

                </label>
              ),
            )}

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
                已選擇{" "}
                {images.length}{" "}
                張圖片
              </p>
            </div>

          </div>


          {images.length > 0 ? (

            <div className="escape-room-images-grid">

              {images.map(
                (
                  file,
                  index,
                ) => {

                  const previewUrl =
                    imagePreviews[
                      index
                    ];


                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="escape-room-image-item"
                    >

                      <div className="escape-room-image-preview">

                        {previewUrl && (
                          <img
                            src={
                              previewUrl
                            }
                            alt={
                              file.name
                            }
                          />
                        )}

                      </div>


                      <div className="escape-room-image-info">

                        <span
                          className="escape-room-image-name"
                          title={
                            file.name
                          }
                        >
                          {file.name}
                        </span>


                        <button
                          type="button"
                          className="delete-image-button"
                          onClick={() =>
                            handleRemoveImage(
                              index,
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          移除
                        </button>

                      </div>

                    </div>
                  );
                },
              )}

            </div>

          ) : (

            <div className="no-escape-room-images">
              尚未選擇圖片
            </div>

          )}


          <div className="upload-images-box">

            <label
              htmlFor="create-image-upload"
              className="upload-images-button"
            >
              ＋ 選擇圖片
            </label>


            <input
              id="create-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              onChange={
                handleImageSelect
              }
              disabled={saving}
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
              navigate(
                "/escape-rooms",
              )
            }
            disabled={saving}
          >
            取消
          </button>


          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "建立中..."
              : "建立密室"}
          </button>

        </div>

      </form>

    </div>
  );
}


export default CreateEscapeRoom;