import React from 'react';
import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="App-header">
      <Link to="/">
      <h1>CodeShare</h1>
      </Link>
    </header>
  );
}

export default Header;
