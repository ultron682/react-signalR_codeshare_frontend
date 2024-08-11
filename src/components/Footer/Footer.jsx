import React from "react";
import styles from "./Footer.module.css";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";

function Footer({isHidden}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <footer
      className={
        styles.Footer +
        " " +
        (theme === "light" ? styles.light_theme : styles.dark_theme)
        + (isHidden ? " " + styles.hidden : "")
      }
    >
      <p className={styles.title}>{t("footer")}</p>
    </footer>
  );
}

export default Footer;
