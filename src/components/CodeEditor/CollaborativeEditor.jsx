import React, { useRef , useEffect} from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/material-darker.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/css/css.js";
import "codemirror/mode/go/go.js";
import "codemirror/mode/php/php.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/sql/sql.js";
import "codemirror/mode/swift/swift.js";

const CollaborativeEditor = ({
  documentContent,
  setDocumentContent,
  languageProg,
  theme,
  onHandleEditorChange,
  isConnected,
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      
      console.log("Editor instance:", editor); // Debug: sprawdzenie instancji edytora

      const showTooltip = (e) => {
        const { clientX: x, clientY: y } = e;
        const coords = editor.coordsChar({ left: x, top: y });
        const token = editor.getTokenAt(coords);

        if (!token || !token.string) return; // Jeśli brak tokenu, wyjście

        // Debug: sprawdzenie tokena
        console.log("Token under cursor:", token);

        // Tworzenie elementu plakietki
        const tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "yellow";
        tooltip.style.padding = "5px";
        tooltip.style.border = "1px solid black";
        tooltip.style.zIndex = 1000;
        tooltip.textContent = `Info: ${token.string}`;
        document.body.appendChild(tooltip);

        // Ustawienie pozycji plakietki
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;

        const removeTooltip = () => {
          tooltip.remove();
        };

        editor.on("mouseout", removeTooltip);
        editor.on("cursorActivity", removeTooltip);
      };

      editor.on("mousemove", showTooltip);

      return () => {
        editor.off("mousemove", showTooltip);
      };
    }
  }, [editorRef]);


  return (
    <CodeMirror
      ref={editorRef}
      value={documentContent}
      options={{
        mode: languageProg,
        theme: theme === "light" ? "material" : "material-darker",
        lineNumbers: true,
        lineWrapping: true,
        readOnly: !isConnected ? "nocursor" : false
      }}
      onBeforeChange={(editor, data, value) => {
        setDocumentContent(value);
        onHandleEditorChange(editor, data, value);
      }}
    />
  );
};

export default CollaborativeEditor;
