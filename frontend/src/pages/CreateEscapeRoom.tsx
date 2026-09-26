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
  getEscapeRooms,
} from "../api/escapeRooms";

import {
  getStudios,
  createStudio,
} from "../api/studios";

import {
  getLocations,
  createLocation,
} from "../api/locations";

import type {
  EscapeRoom,
  EscapeRoomInput,
  Participants,
  Studio,
  Location,
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
      studio_id: null,
      dates: [],
      location_id: null,
      min_people: null,
      max_people: null,
      participants:
        initialParticipants,
    });


  /*
   * 工作室列表
   */
  const [studios, setStudios] =
    useState<Studio[]>([]);
  
  const [escapeRooms, setEscapeRooms] =
    useState<EscapeRoom[]>([]);

  /*
   * 地點列表
   */
  const [locations, setLocations] =
    useState<Location[]>([]);


  /*
   * 新增工作室時使用的文字。
   */
  const [newStudioName, setNewStudioName] =
    useState("");


  /*
   * 新增地點時使用的文字。
   */
  const [newLocationName, setNewLocationName] =
    useState("");


  /*
   * 是否顯示新增工作室輸入框。
   */
  const [showNewStudio, setShowNewStudio] =
    useState(false);


  /*
   * 是否顯示新增地點輸入框。
   */
  const [showNewLocation, setShowNewLocation] =
    useState(false);


  /*
   * 目前正在日期輸入框中選擇的日期。
   *
   * 注意：
   * dates 才是真正要送到 API 的日期陣列。
   * dateInput 只是暫存目前選擇的日期。
   */
  const [dateInput, setDateInput] =
    useState("");


  const [images, setImages] =
    useState<File[]>([]);


  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);


  const [saving, setSaving] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  /* ==================================================
     載入工作室 / 地點
     ================================================== */

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          studioData,
          locationData,
          escapeRoomData,
        ] = await Promise.all([
          getStudios(),
          getLocations(),
          getEscapeRooms(),
        ]);

        setStudios(studioData);
        setLocations(locationData);
        setEscapeRooms(escapeRoomData);

      } catch (err) {
        if (
          err instanceof Error
        ) {
          setError(
            err.message,
          );
        } else {
          setError(
            "取得工作室與地點列表失敗",
          );
        }
      }
    }


    loadOptions();
  }, []);


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

  const normalizedRoomName =
    form.name
      .trim()
      .toLowerCase();


  const duplicateEscapeRoom =
    normalizedRoomName
      ? escapeRooms.find(
          (room) =>
            room.name
              .trim()
              .toLowerCase() ===
            normalizedRoomName,
        )
      : undefined;


  const similarEscapeRooms =
    normalizedRoomName
      ? escapeRooms.filter(
          (room) =>
            room.name
              .trim()
              .toLowerCase()
              .includes(
                normalizedRoomName,
              ) &&
            room.id !==
              duplicateEscapeRoom?.id,
        )
      : [];
      
  /* ==================================================
     新增日期
     ================================================== */

  function handleAddDate() {
    if (!dateInput) {
      return;
    }


    /*
     * 避免同一個日期重複加入。
     */
    if (
      form.dates.includes(
        dateInput,
      )
    ) {
      setDateInput("");

      return;
    }


    setForm(
      (currentForm) => ({
        ...currentForm,

        dates: [
          ...currentForm.dates,
          dateInput,
        ].sort(),
      }),
    );


    setDateInput("");
  }


  /* ==================================================
     移除日期
     ================================================== */

  function handleRemoveDate(
    date: string,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,

        dates:
          currentForm.dates.filter(
            (currentDate) =>
              currentDate !== date,
          ),
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
     新增工作室
     ================================================== */

  async function handleCreateStudio() {
    const name =
      newStudioName.trim();


    if (!name) {
      return;
    }


    try {
      const studio =
        await createStudio(
          name,
        );


      /*
       * 加入目前列表。
       */
      setStudios(
        (currentStudios) => [
          ...currentStudios,
          studio,
        ].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
            ),
        ),
      );


      /*
       * 自動選取剛新增的工作室。
       */
      setForm(
        (currentForm) => ({
          ...currentForm,
          studio_id: studio.id,
        }),
      );


      setNewStudioName("");
      setShowNewStudio(false);

    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message,
        );
      } else {
        setError(
          "新增工作室失敗",
        );
      }
    }
  }


  /* ==================================================
     新增地點
     ================================================== */

  async function handleCreateLocation() {
    const name =
      newLocationName.trim();


    if (!name) {
      return;
    }


    try {
      const location =
        await createLocation(
          name,
        );


      /*
       * 加入目前列表。
       */
      setLocations(
        (currentLocations) => [
          ...currentLocations,
          location,
        ].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
            ),
        ),
      );


      /*
       * 自動選取剛新增的地點。
       */
      setForm(
        (currentForm) => ({
          ...currentForm,
          location_id:
            location.id,
        }),
      );


      setNewLocationName("");
      setShowNewLocation(false);

    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message,
        );
      } else {
        setError(
          "新增地點失敗",
        );
      }
    }
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

    if (duplicateEscapeRoom) {
      setError(
        `密室「${duplicateEscapeRoom.name}」已經存在`,
      );

      return;
    }

    if (
      form.min_people !==
        null &&
      form.max_people !==
        null &&
      form.min_people >
        form.max_people
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

          {/* 完全相同 */}
          {duplicateEscapeRoom && (
            <div className="escape-room-name-duplicate">
              ⚠️ 已存在相同名稱的密室：

              <strong>
                {duplicateEscapeRoom.name}
              </strong>
            </div>
          )}

          {/* 類似名稱 */}
          {!duplicateEscapeRoom &&
            similarEscapeRooms.length > 0 && (
              <div className="escape-room-name-suggestions">

                <p>
                  可能已存在相似的密室：
                </p>

                <ul>
                  {similarEscapeRooms
                    .slice(0, 5)
                    .map((room) => (
                      <li key={room.id}>
                        {room.name}
                      </li>
                    ))}
                </ul>

              </div>
            )}

        </div>


        {/* =========================
            工作室
        ========================= */}

        <div className="escape-room-field">

          <label htmlFor="studio">
            工作室
          </label>

          <select
            id="studio"
            value={
              form.studio_id ?? ""
            }
            onChange={(event) =>
              setForm(
                (currentForm) => ({
                  ...currentForm,
                  studio_id:
                    event.target.value
                      ? Number(
                          event.target.value,
                        )
                      : null,
                }),
              )
            }
          >

            <option value="">
              請選擇工作室
            </option>

            {studios.map(
              (studio) => (
                <option
                  key={studio.id}
                  value={studio.id}
                >
                  {studio.name}
                </option>
              ),
            )}

          </select>


          {!showNewStudio ? (

            <button
              type="button"
              onClick={() =>
                setShowNewStudio(true)
              }
            >
              ＋ 新增工作室
            </button>

          ) : (

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
              }}
            >

              <input
                type="text"
                value={newStudioName}
                placeholder="輸入新工作室名稱"
                onChange={(event) =>
                  setNewStudioName(
                    event.target.value,
                  )
                }
              />

              <button
                type="button"
                onClick={
                  handleCreateStudio
                }
              >
                新增
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewStudioName("");
                  setShowNewStudio(false);
                }}
              >
                取消
              </button>

            </div>

          )}

        </div>


        {/* =========================
            日期
        ========================= */}

        <div className="escape-room-field">

          <label htmlFor="date">
            日期
          </label>


          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >

            <input
              id="date"
              type="date"
              value={dateInput}
              onChange={(event) =>
                setDateInput(
                  event.target.value,
                )
              }
            />


            <button
              type="button"
              onClick={
                handleAddDate
              }
            >
              新增日期
            </button>

          </div>


          {form.dates.length > 0 && (

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >

              {form.dates.map(
                (date) => (

                  <div
                    key={date}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >

                    <span>
                      {date}
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveDate(
                          date,
                        )
                      }
                    >
                      移除
                    </button>

                  </div>

                ),
              )}

            </div>

          )}

        </div>


        {/* =========================
            地點
        ========================= */}

        <div className="escape-room-field">

          <label htmlFor="location">
            地點
          </label>

          <select
            id="location"
            value={
              form.location_id ?? ""
            }
            onChange={(event) =>
              setForm(
                (currentForm) => ({
                  ...currentForm,
                  location_id:
                    event.target.value
                      ? Number(
                          event.target.value,
                        )
                      : null,
                }),
              )
            }
          >

            <option value="">
              請選擇地點
            </option>

            {locations.map(
              (location) => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.name}
                </option>
              ),
            )}

          </select>


          {!showNewLocation ? (

            <button
              type="button"
              onClick={() =>
                setShowNewLocation(true)
              }
            >
              ＋ 新增地點
            </button>

          ) : (

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
              }}
            >

              <input
                type="text"
                value={newLocationName}
                placeholder="輸入新地點名稱"
                onChange={(event) =>
                  setNewLocationName(
                    event.target.value,
                  )
                }
              />

              <button
                type="button"
                onClick={
                  handleCreateLocation
                }
              >
                新增
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewLocationName("");
                  setShowNewLocation(false);
                }}
              >
                取消
              </button>

            </div>

          )}

        </div>


        {/* =========================
            人數
        ========================= */}

        <div className="escape-room-field">

          <label htmlFor="min_people">
            最少人數
          </label>

          <input
            id="min_people"
            type="number"
            min="1"
            value={
              form.min_people ??
              ""
            }
            onChange={(event) =>
              updateField(
                "min_people",
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

          <label htmlFor="max_people">
            最多人數
          </label>

          <input
            id="max_people"
            type="number"
            min="1"
            value={
              form.max_people ??
              ""
            }
            onChange={(event) =>
              updateField(
                "max_people",
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
            disabled={
              saving ||
              Boolean(duplicateEscapeRoom)
            }
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