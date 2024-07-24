import React, { useContext, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import { useTheme } from "../ThemeContext";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { AuthContext } from "../AuthContext";
import { useTranslation } from "react-i18next";

function Header() {
  const { toggleTheme, theme } = useTheme();
  const { user } = useContext(AuthContext);
  const {
    t,
    i18n: { changeLanguage, language },
  } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // useEffect(() => {

  //   if (user.email) {
  //     setIsLoggedIn(true);
  //   }
  // }, []);

  const handleChangeLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "pl" : "en";
    setCurrentLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  return (
    <header className={theme === "light" ? "light-theme" : "dark-theme"}>
      <button onClick={toggleTheme}>
        {theme === "light" ? (
          <MdLightMode size={30} />
        ) : (
          <MdDarkMode size={30} />
        )}
      </button>
      <Link to="/">
        <h1>CodeShare</h1>
      </Link>
      {user ? (
        <Link to="/account">
          <VscAccount size={30} /> <div>{user.userName}</div>
        </Link> // Wyświetlanie nazwy użytkownika, gdy jest zalogowany
      ) : (
        <Link to="/account/login">
          <VscAccount size={30} />
        </Link> // Przycisk do logowania/rejestracji, gdy użytkownik nie jest zalogowany
      )}

      <button type="button" onClick={handleChangeLanguage}>
        PL/EN
      </button>
    </header>
  );
}
export default Header;
