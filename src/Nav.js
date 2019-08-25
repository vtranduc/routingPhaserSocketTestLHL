import React from "react";
// import logo from "./logo.svg";
import "./App.css";
import { Link } from "react-router-dom";

function Nav() {
  const navStyle = {
    color: "red"
  };
  return (
    <nav>
      <h3>Logo</h3>
      <ul className="nav-links">
        <Link style={navStyle} to="/about">
          <li>About</li>
        </Link>
        <Link style={navStyle} to="/shop">
          <li>Shop</li>
        </Link>
        <Link style={navStyle} to="/game">
          <li>Game</li>
        </Link>
        <Link style={navStyle} to="/ballkicking">
          <li>Ball Kicking</li>
        </Link>
      </ul>
    </nav>
  );
}

export default Nav;
