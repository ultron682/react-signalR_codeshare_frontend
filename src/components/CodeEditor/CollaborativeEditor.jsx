import React, { useRef } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";

const CollaborativeEditor = ({
  documentContent,
  setDocumentContent,
  languageProg,
  theme,
  onHandleEditorChange,
  isConnected
}) => {
  const editorRef = useRef(null);

  return (
    <CodeMirror
      ref={editorRef}
      value={documentContent}
      options={{
        mode: languageProg,
        theme: theme === "light" ? "material" : "material-darker",
        lineNumbers: true,
        lineWrapping: true,
         readOnly: !isConnected ? "nocursor" : false,
      }}
      onBeforeChange={(editor, data, value) => {
        console.log(1);
        setDocumentContent(value);
        onHandleEditorChange(editor, data, value);
      }}
    />
  );
};

export default CollaborativeEditor;
