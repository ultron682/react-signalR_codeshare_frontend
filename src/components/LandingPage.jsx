import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { useTheme } from "./ThemeContext";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const [uniqueId, setUniqueId] = useState("");
  const { theme } = useTheme();
  const {
    t,
  } = useTranslation();

  const generateUniqueId = () => {
    return "xxxxx".replace(/x/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  };

  useEffect(() => {
    setUniqueId(generateUniqueId());
  }, []);

  return (
    <div className={`${styles.landing_container} ${theme === 'light' ? styles.light_theme : styles.dark_theme}`}>
      <h1>Welcome to Code Base</h1>
      <p>Your journey with Awesome Code experiences starts here.</p>
      <div className={styles.button_group}>
        <Link to={uniqueId} className={styles.landing_button}>
          {t("startHere")}
        </Link>
      </div>
      <div className={styles.button_group}>
        <Link to="/account/login" className={styles.landing_button}>
          {t("login")}
        </Link>
        <Link to="/account/register" className={styles.landing_button}>
          {t("register")}
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
