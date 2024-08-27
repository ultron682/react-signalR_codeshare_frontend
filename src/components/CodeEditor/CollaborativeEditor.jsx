import React, { useRef, useEffect } from "react";
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

import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";

const CollaborativeEditor = ({
  documentContent,
  setDocumentContent,
  languageProg,
  theme,
  onHandleEditorChange,
  isConnected,
}) => {
  const editor = useRef();

  useEffect(() => {
    const log = (event) => console.log(event);
    // editor.current.addEventListener("input", log);

    const state = EditorState.create({
      doc: "a ",
      extensions: [basicSetup, javascript()],
    });
    const view = new EditorView({ state, parent: editor.current });
    return () => {
      view.destroy();
      // editor.current.removeEventListener("input", log);
    };
  }, []);

  return <div ref={editor}></div>;
};

export default CollaborativeEditor;
