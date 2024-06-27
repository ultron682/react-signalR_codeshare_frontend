import React from "react";
import "./App.css";
import CodeEditor from "./CodeEditor";
import Header from "./components/Header";
import Footer from "./components/Footer";

import './i18n.js'

function App() {
  return (
    <div className="App">
      <Header />

      <CodeEditor class="CodeEditor" />

      <Footer />
    </div>
  );
}

export default App;
