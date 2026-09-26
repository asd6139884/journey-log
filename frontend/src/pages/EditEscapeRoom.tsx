import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteEscapeRoomImage,
  getEscapeRoom,
  getEscapeRooms,
  updateEscapeRoom,
  uploadEscapeRoomImage,
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


function EditEscapeRoom() {
  const { id } =
    useParams<{
      id: string;
    }>();

  const navigate =
    useNavigate();


  /* ==================================================
     State
     ================================================== */

  const [room, setRoom] =
    useState<EscapeRoom | null>(
      null,
    );


  /*
   * 所有密室列表。
   *
   * 用來檢查編輯後的密室名稱是否
   * 與其他密室重複或相似。
   */
  const [escapeRooms, setEscapeRooms] =
    useState<EscapeRoom[]>([]);


  /*
   * 工作室列表
   */
  const [studios, setStudios] =
    useState<Studio[]>([]);


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
   */
  const [dateInput, setDateInput] =
    useState("");


  const [loading, setLoading] =
    useState(true);


  const [saving, setSaving] =
    useState(false);


  const [uploading, setUploading] =
    useState(false);


  const [
    deletingImageId,
    setDeletingImageId,
  ] =
    useState<number | null>(null);


  const [error, setError] =
    useState<string | null>(
      null,
    );


  /* ==================================================
     取得工作室 / 地點 / 密室列表
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

        setEscapeRooms(
          escapeRoomData,
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
            "取得工作室、地點與密室列表失敗",
          );
        }
      }
    }


    loadOptions();
  }, []);


  /* ==================================================
     取得密室資料
     ================================================== */

  useEffect(() => {
    async function loadRoom() {
      if (!id) {
        setError(
          "找不到密室 ID",
        );

        setLoading(false);

        return;
      }


      const roomId =
        Number(id);


      if (
        !Number.isInteger(
          roomId,
        )
      ) {
        setError(
          "密室 ID 無效",
        );

        setLoading(false);

        return;
      }


      try {
        setLoading(true);
        setError(null);


        const data =
          await getEscapeRoom(
            roomId,
          );


        setRoom(data);

      } catch (err) {
        if (
          err instanceof Error
        ) {
          setError(
            err.message,
          );
        } else {
          setError(
            "取得密室資料失敗",
          );
        }

      } finally {
        setLoading(false);
      }
    }


    loadRoom();

  }, [id]);


  /* ==================================================
     密室名稱檢查
     ================================================== */

  /*
   * 將目前輸入的名稱標準化。
   *
   * trim()
   * → 移除前後空白
   *
   * toLowerCase()
   * → 英文字母大小寫視為相同
   */
  const normalizedRoomName =
    room?.name
      .trim()
      .toLowerCase() ?? "";


  /*
   * 完全相同的密室名稱。
   *
   * 注意：
   * 必須排除目前正在編輯的密室自己。
   *
   * 例如：
   *
   * id = 1
   * 名稱 = 哈梅爾寺
   *
   * 自己本身不算重複。
   */
  const duplicateEscapeRoom =
    normalizedRoomName
      ? escapeRooms.find(
          (escapeRoom) =>
            escapeRoom.id !==
              room?.id &&
            escapeRoom.name
              .trim()
              .toLowerCase() ===
              normalizedRoomName,
        )
      : undefined;


  /*
   * 可能相似的密室名稱。
   *
   * 同樣需要排除目前正在編輯的密室自己。
   *
   * 例如：
   *
   * 目前：
   * 哈梅爾
   *
   * 其他：
   * 哈梅爾寺
   * 哈梅爾寺：最終章
   *
   * 就會顯示在相似名稱提示。
   */
  const similarEscapeRooms =
    normalizedRoomName
      ? escapeRooms.filter(
          (escapeRoom) =>
            escapeRoom.id !==
              room?.id &&
            escapeRoom.name
              .trim()
              .toLowerCase()
              .includes(
                normalizedRoomName,
              ),
        )
      : [];


  /* ==================================================
     更新基本欄位
     ================================================== */

  function updateField(
    field: keyof EscapeRoomInput,
    value:
      | string
      | number
      | null,
  ) {
    if (!room) {
      return;
    }


    setRoom({
      ...room,
      [field]: value,
    });
  }


  /* ==================================================
     新增日期
     ================================================== */

  function handleAddDate() {
    if (!room) {
      return;
    }


    if (!dateInput) {
      return;
    }


    /*
     * 避免同一天重複加入。
     */
    if (
      room.dates.includes(
        dateInput,
      )
    ) {
      setDateInput("");

      return;
    }


    setRoom({
      ...room,

      dates: [
        ...room.dates,
        dateInput,
      ].sort(),
    });


    setDateInput("");
  }


  /* ==================================================
     移除日期
     ================================================== */

  function handleRemoveDate(
    date: string,
  ) {
    if (!room) {
      return;
    }


    setRoom({
      ...room,

      dates:
        room.dates.filter(
          (currentDate) =>
            currentDate !== date,
        ),
    });
  }


  /* ==================================================
     更新參加者
     ================================================== */

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
      setRoom(
        (currentRoom) => {
          if (!currentRoom) {
            return currentRoom;
          }


          return {
            ...currentRoom,
            studio_id: studio.id,
            studio_name: studio.name,
          };
        },
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
      setRoom(
        (currentRoom) => {
          if (!currentRoom) {
            return currentRoom;
          }


          return {
            ...currentRoom,
            location_id: location.id,
            location_name: location.name,
          };
        },
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
     新增圖片
     ================================================== */

  async function handleImageUpload(
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!room) {
      return;
    }


    const files =
      Array.from(
        event.target.files ?? [],
      );


    if (
      files.length === 0
    ) {
      return;
    }


    try {
      setUploading(true);
      setError(null);


      // 依序上傳圖片
      for (
        const file of files
      ) {
        const uploadedImage =
          await uploadEscapeRoomImage(
            room.id,
            file,
          );


        setRoom(
          (
            currentRoom,
          ) => {
            if (!currentRoom) {
              return currentRoom;
            }


            return {
              ...currentRoom,

              images: [
                ...(
                  currentRoom.images ??
                  []
                ),
                uploadedImage,
              ],
            };
          },
        );
      }

    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message,
        );
      } else {
        setError(
          "圖片上傳失敗",
        );
      }

    } finally {
      setUploading(false);

      /*
       * 允許再次選擇同一張圖片。
       */
      event.target.value = "";
    }
  }


  /* ==================================================
     刪除圖片
     ================================================== */

  async function handleDeleteImage(
    imageId: number,
    imageName: string,
  ) {
    if (!room) {
      return;
    }


    const confirmed =
      window.confirm(
        `確定要刪除圖片「${imageName}」嗎？\n\n` +
          "刪除後無法復原。",
      );


    if (!confirmed) {
      return;
    }


    try {
      setDeletingImageId(
        imageId,
      );

      setError(null);


      await deleteEscapeRoomImage(
        room.id,
        imageId,
      );


      setRoom(
        (
          currentRoom,
        ) => {
          if (!currentRoom) {
            return currentRoom;
          }


          return {
            ...currentRoom,

            images: (
              currentRoom.images ??
              []
            ).filter(
              (image) =>
                image.id !==
                imageId,
            ),
          };
        },
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
          "圖片刪除失敗",
        );
      }

    } finally {
      setDeletingImageId(
        null,
      );
    }
  }


  /* ==================================================
     儲存
     ================================================== */

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    if (!room) {
      return;
    }


    /*
     * 檢查密室名稱是否為空。
     */
    if (
      !room.name.trim()
    ) {
      setError(
        "請輸入密室名稱",
      );

      return;
    }


    /*
     * 檢查是否存在其他相同名稱的密室。
     *
     * 目前正在編輯的密室自己
     * 已經在 duplicateEscapeRoom
     * 中排除了。
     */
    if (duplicateEscapeRoom) {
      setError(
        `密室「${duplicateEscapeRoom.name}」已經存在`,
      );

      return;
    }


    /*
     * 檢查最少 / 最多人數。
     */
    if (
      room.min_people !==
        null &&
      room.max_people !==
        null &&
      room.min_people >
        room.max_people
    ) {
      setError(
        "最少人數不能大於最多人數",
      );

      return;
    }


    try {
      setSaving(true);
      setError(null);


      const data:
        EscapeRoomInput = {
        name:
          room.name,

        studio_id:
          room.studio_id,

        dates:
          room.dates,

        location_id:
          room.location_id,

        min_people:
          room.min_people,

        max_people:
          room.max_people,

        participants:
          room.participants,
      };


      await updateEscapeRoom(
        room.id,
        data,
      );


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
          "更新密室失敗",
        );
      }

    } finally {
      setSaving(false);
    }
  }


  /* ==================================================
     Loading
     ================================================== */

  if (loading) {
    return (
      <div className="escape-room-form-page">
        載入密室資料中...
      </div>
    );
  }


  /* ==================================================
     找不到資料
     ================================================== */

  if (!room) {
    return (
      <div className="escape-room-form-page">

        <p className="escape-room-form-error">
          {error ??
            "找不到密室資料"}
        </p>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/escape-rooms",
            )
          }
        >
          返回密室列表
        </button>

      </div>
    );
  }


  const images =
    room.images ?? [];


  return (
    <div className="escape-room-form-page">

      <h1>編輯密室</h1>


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
            value={
              room.name
            }
            onChange={(
              event,
            ) =>
              updateField(
                "name",
                event.target.value,
              )
            }
          />


          {/* =========================
              完全相同
          ========================= */}

          {duplicateEscapeRoom && (
            <div className="escape-room-name-duplicate">

              ⚠️ 已存在相同名稱的密室：

              <strong>
                {
                  duplicateEscapeRoom.name
                }
              </strong>

            </div>
          )}


          {/* =========================
              類似名稱
          ========================= */}

          {!duplicateEscapeRoom &&
            similarEscapeRooms.length >
              0 && (
              <div className="escape-room-name-suggestions">

                <p>
                  可能已存在相似的密室：
                </p>


                <ul>
                  {similarEscapeRooms
                    .slice(0, 5)
                    .map(
                      (
                        escapeRoom,
                      ) => (
                        <li
                          key={
                            escapeRoom.id
                          }
                        >
                          {
                            escapeRoom.name
                          }
                        </li>
                      ),
                    )}
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
              room.studio_id ?? ""
            }
            onChange={(event) =>
              setRoom(
                (currentRoom) => {
                  if (
                    !currentRoom
                  ) {
                    return currentRoom;
                  }


                  const studioId =
                    event.target
                      .value
                      ? Number(
                          event.target
                            .value,
                        )
                      : null;


                  const selectedStudio =
                    studios.find(
                      (studio) =>
                        studio.id ===
                        studioId,
                    );


                  return {
                    ...currentRoom,

                    studio_id:
                      studioId,

                    studio_name:
                      selectedStudio
                        ?.name ??
                      null,
                  };
                },
              )
            }
            disabled={
              saving ||
              uploading ||
              deletingImageId !==
                null
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
              disabled={
                saving ||
                uploading ||
                deletingImageId !==
                  null
              }
            >
              ＋ 新增工作室
            </button>

          ) : (

            <div
              style={{
                display:
                  "flex",
                gap: "8px",
                marginTop:
                  "8px",
              }}
            >

              <input
                type="text"
                value={
                  newStudioName
                }
                placeholder="輸入新工作室名稱"
                onChange={(
                  event,
                ) =>
                  setNewStudioName(
                    event.target
                      .value,
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
                  setNewStudioName(
                    "",
                  );

                  setShowNewStudio(
                    false,
                  );
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
              display:
                "flex",
              gap: "8px",
            }}
          >

            <input
              id="date"
              type="date"
              value={
                dateInput
              }
              onChange={(
                event,
              ) =>
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
              disabled={
                saving ||
                uploading ||
                deletingImageId !==
                  null
              }
            >
              新增日期
            </button>

          </div>


          {room.dates.length >
            0 && (

            <div
              style={{
                marginTop:
                  "12px",

                display:
                  "flex",

                flexWrap:
                  "wrap",

                gap: "8px",
              }}
            >

              {room.dates.map(
                (date) => (

                  <div
                    key={date}
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

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
                      disabled={
                        saving ||
                        uploading ||
                        deletingImageId !==
                          null
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
              room.location_id ?? ""
            }
            onChange={(event) =>
              setRoom(
                (currentRoom) => {
                  if (
                    !currentRoom
                  ) {
                    return currentRoom;
                  }


                  const locationId =
                    event.target
                      .value
                      ? Number(
                          event.target
                            .value,
                        )
                      : null;


                  const selectedLocation =
                    locations.find(
                      (location) =>
                        location.id ===
                        locationId,
                    );


                  return {
                    ...currentRoom,

                    location_id:
                      locationId,

                    location_name:
                      selectedLocation
                        ?.name ??
                      null,
                  };
                },
              )
            }
            disabled={
              saving ||
              uploading ||
              deletingImageId !==
                null
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
                setShowNewLocation(
                  true,
                )
              }
              disabled={
                saving ||
                uploading ||
                deletingImageId !==
                  null
              }
            >
              ＋ 新增地點
            </button>

          ) : (

            <div
              style={{
                display:
                  "flex",
                gap: "8px",
                marginTop:
                  "8px",
              }}
            >

              <input
                type="text"
                value={
                  newLocationName
                }
                placeholder="輸入新地點名稱"
                onChange={(
                  event,
                ) =>
                  setNewLocationName(
                    event.target
                      .value,
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
                  setNewLocationName(
                    "",
                  );

                  setShowNewLocation(
                    false,
                  );
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
              room.min_people ??
              ""
            }
            onChange={(
              event,
            ) =>
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
              room.max_people ??
              ""
            }
            onChange={(
              event,
            ) =>
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
                      room.participants[
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

              <h2>
                圖片
              </h2>


              <p>
                目前共有{" "}
                {
                  images.length
                }{" "}
                張圖片
              </p>

            </div>

          </div>


          {images.length >
          0 ? (

            <div className="escape-room-images-grid">

              {images.map(
                (
                  image,
                ) => (

                  <div
                    key={
                      image.id
                    }
                    className="escape-room-image-item"
                  >

                    <div className="escape-room-image-preview">

                      <img
                        src={
                          image.image_url
                        }
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
                        title={
                          image.name
                        }
                      >
                        {
                          image.name
                        }
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

                ),
              )}

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
              onChange={
                handleImageUpload
              }
              disabled={
                uploading ||
                saving ||
                deletingImageId !==
                  null
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
              navigate(
                "/escape-rooms",
              )
            }
            disabled={
              saving ||
              uploading ||
              deletingImageId !==
                null
            }
          >
            取消
          </button>


          <button
            type="submit"
            disabled={
              saving ||
              uploading ||
              deletingImageId !==
                null ||
              Boolean(
                duplicateEscapeRoom,
              )
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
