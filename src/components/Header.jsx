import React, { useState, useEffect } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import { useTheme } from './ThemeContext';
import { MdLightMode, MdDarkMode  } from "react-icons/md";

function Header({user}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toggleTheme, theme } = useTheme();

  useEffect(() => {

    if (user.email) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <header className={theme === 'light' ? 'light-theme' : 'dark-theme'}>
      
      <button onClick={toggleTheme}>
        {theme === 'light' ? <MdLightMode size={30} /> : <MdDarkMode size={30} />}
        </button>
      <Link to="/">
        <h1>CodeShare</h1>
      </Link>
      {isLoggedIn ? (
        <div>{user.email}</div> // Wyświetlanie nazwy użytkownika, gdy jest zalogowany
      ) : (
        <Link to="/login">
          <VscAccount size={30} />
        </Link> // Przycisk do logowania/rejestracji, gdy użytkownik nie jest zalogowany
      )}
    </header>
  );
}
export default Header;
