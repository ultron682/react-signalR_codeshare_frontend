import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import CodeEditor from "./components/CodeEditor/CodeEditor";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Account from "./components/Account";
import LandingPage from "./components/LandingPage";

import { useTheme } from "./components/ThemeContext";
import "./i18n.js";
import "./App.css";

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-container">
      <Header />

      <main>
        <Routes>
          <Route path="/account/login" element={<LoginForm />} />
          <Route path="/account/register" element={<RegisterForm />} />
          <Route path="/account" element={<Account />} />
          <Route path="/:id" element={<CodeEditor class="CodeEditor" />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
