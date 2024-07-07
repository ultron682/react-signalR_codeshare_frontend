import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import CodeEditor from "./components/CodeEditor.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Account from "./components/Account";
import LandingPage from "./components/LandingPage.jsx";

import { useTheme } from "./components/ThemeContext";
import "./i18n.js";
import "./App.css";

function App() {
  const { theme } = useTheme();
  const [user, setUser] = useState({email: '', isEmailConfirmed: true});

  const fetchAccountInfo = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.get("http://localhost:5555/manage/info", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response.data);
      setUser(response.data);
      // Tutaj możesz przetworzyć dane, np. aktualizując stan komponentu
    } catch (error) {
      console.error("Błąd podczas pobierania informacji o koncie:", error);
      // Obsługa błędów, np. informowanie użytkownika
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-container">
      <Header user={user} />

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/account" element={<Account user={user} />} />
        <Route path="/:id" element={<CodeEditor class="CodeEditor" />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
