import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import EscapeRooms from "./pages/EscapeRooms";
import Travels from "./pages/Travels";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/escape-rooms" element={<EscapeRooms />} />
          <Route path="/travels" element={<Travels />} />
        </Routes>
      </main>
    </>
  );
}

export default App;