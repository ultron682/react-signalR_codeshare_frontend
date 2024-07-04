import React from "react";
import "./App.css";
import CodeEditor from "./CodeEditor";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import "./i18n.js";
import LandingPage from "./components/LandingPage.jsx";

function App() {
  return (
    <div className="app-container">
      <Header />
      
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/:id" element={<CodeEditor class="CodeEditor" />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      <Footer />
    </div>
  );
}

export default App;