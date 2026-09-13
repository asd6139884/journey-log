import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import EscapeRooms from "./pages/EscapeRooms";
import Travels from "./pages/Travels";
import CreateEscapeRoom from "./pages/CreateEscapeRoom";
import EditEscapeRoom from "./pages/EditEscapeRoom";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>

          {/* 首頁 */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* 登入 */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* 密室逃脫：觀看 */}
          <Route
            path="/escape-rooms"
            element={
              <ProtectedRoute
                permission="escape_room_view"
              >
                <EscapeRooms />
              </ProtectedRoute>
            }
          />

          {/* 密室逃脫：新增 */}
          <Route
            path="/escape-rooms/new"
            element={
              <ProtectedRoute
                permission="escape_room_edit"
              >
                <CreateEscapeRoom />
              </ProtectedRoute>
            }
          />

          {/* 密室逃脫：編輯 */}
          <Route
            path="/escape-rooms/:id/edit"
            element={
              <ProtectedRoute
                permission="escape_room_edit"
              >
                <EditEscapeRoom />
              </ProtectedRoute>
            }
          />

          {/* 旅遊 */}
          <Route
            path="/travels"
            element={<Travels />}
          />

        </Routes>
      </main>
    </>
  );
}

export default App;