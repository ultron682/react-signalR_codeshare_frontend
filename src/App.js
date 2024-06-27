import React from "react";
import "./App.css";
import CodeEditor from "./CodeEditor";


//import "codemirror/mode/javascript/javascript.js";

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <h1>CodeShare</h1>
      </header>
      <CodeEditor />
      
    </div>
  );
}

export default App;
