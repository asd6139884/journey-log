import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <div>
        <NavLink to="/">Journey Log</NavLink>
      </div>

      <div>
        <NavLink to="/">首頁</NavLink>
        <NavLink to="/escape-rooms">🔐 密室逃脫</NavLink>
        <NavLink to="/travels">✈️ 旅遊</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;