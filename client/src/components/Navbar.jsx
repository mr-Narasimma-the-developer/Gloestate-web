import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Gloaro<span>Estate</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="navbar-link" onClick={closeMenu}>Browse</Link>

          {user && user.role === "seller" && (
            <Link to="/seller/dashboard" className="navbar-link" onClick={closeMenu}>Dashboard</Link>
          )}
          {user && (
            <Link to="/favorites" className="navbar-link" onClick={closeMenu}>Saved</Link>
          )}
          {user && (
            <Link to="/inbox" className="navbar-link" onClick={closeMenu}>Inbox</Link>
          )}

          {user ? (
            <div className="navbar-user">
              <Link to="/profile" className="navbar-profile-link" onClick={closeMenu}>
                <span className="navbar-badge">{user.role}</span>
                <span className="navbar-name">{user.name}</span>
              </Link>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/login" className="btn btn-outline" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;  