import React, { useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { xml } from "@codemirror/lang-xml";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { dracula, draculaDarkStyle } from "@uiw/codemirror-theme-dracula"; // Przykładowe tematy

import {ChangeSet, Text} from "@codemirror/state"
import {Update, rebaseUpdates} from "@codemirror/collab"

const languageModes = {
  javascript: javascript(),
  xml: xml(),
  css: css(),
  go: go(),
  php: php(),
  python: python(),
  sql: sql(),
};

const CollaborativeEditor = ({
  documentContent,
  setDocumentContent,
  languageProg,
  theme,
  onHandleEditorChange,
  isConnected,
}) => {
  const editorRef = useRef(null);

  const handleEditorChange = (value, viewUpdate) => {
    setDocumentContent(value);
    //console.log("handleEditorChange", viewUpdate);
    onHandleEditorChange(value, viewUpdate, editorRef);
  };

  return (
    <CodeMirror
      ref={editorRef}
      value={documentContent}
      height="100%"
      // theme={theme === "light" ? draculaDarkStyle : dracula} // Możesz zmienić na inne dostępne tematy
      // extensions={[languageModes[languageProg]]}
      onChange={handleEditorChange}
      editable={isConnected}
    />
  );
};

export default CollaborativeEditor;
