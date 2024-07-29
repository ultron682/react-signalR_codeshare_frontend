import React from 'react';
import styles from './Footer.module.css';
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.Footer}>
      <p className={styles.title}>{t("footer")}</p>
    </footer>
  );
}

export default Footer;
