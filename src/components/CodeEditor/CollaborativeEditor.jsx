import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { use } from "i18next";

const CollaborativeEditor = ({ documentId }) => {
  const [connection, setConnection] = useState(null);
  const [documentContent, setDocumentContent] = useState("");
  const documentContentRef = useRef(documentContent);
  documentContentRef.current = documentContent;

  const isServerChangeRef = useRef(false);

  const editorRef = useRef(null);

  const setValueWithoutTriggeringOnChange = (newValue) => {
    if (editorRef.current) {
      //editorRef.current.editor.off("change");

      //console.log(editorRef.current);
      editorRef.current.editor.getDoc().setValue(newValue);
      //console.log(editorRef.current);
      //editorRef.current.editor.on("change");
    }
  };

  useEffect(() => {
    const connect = async () => {
      const newConnection = new HubConnectionBuilder()
        .withUrl("http://localhost:5555/codesharehub", {
          withCredentials: false,
        })
        .withAutomaticReconnect()
        .build();

    setConnection(newConnection);

    const startEditor = async () => {
      const state = EditorState.create({
        doc: Text.of(["Loading..."]),
        extensions: [basicSetup, peerExtension(newConnection)],
      });

      const newView = new EditorView({
        state,
        parent: editor.current,
      });

      setView(newView);
    };

    connect();

    return () => {
      if (connection) {
        connection.invoke("UnsubscribeDocument", documentId);
        connection.stop();
      }
    };
  }, [documentId]);

  useEffect(() => {
    isServerChangeRef.current = false;
  }, [documentContent]);

  const applyChangeSet = (doc, changeSet) => {
    let newChanges = undefined;

    if (changeSet.Text === "") {
      newChanges = doc.substring(0, changeSet.Start) +
      changeSet.Text +
      doc.substring(changeSet.Start + changeSet.Length);;
    } else {
      newChanges =
        doc.substring(0, changeSet.Start) +
        changeSet.Text +
        doc.substring(changeSet.Start + changeSet.Length);
    }
    //console.log("applyChangeSet", doc, changeSet, newChanges);

    return newChanges;
  };

  // only fully executed when current client makes a new change
  const handleEditorChange = (editor, data, value) => {
    //console.log("handleEditorChange", isServerChangeRef.current);
    if (isServerChangeRef.current === true) return;

    if (connection) {
      const start = editor.indexFromPos(data.from);
      const end = editor.indexFromPos(data.to);
      const length = end - start;

      const changeSet = {
        Start: start,
        Length: length,
        Text: data.text.join("\n"), // Tekst wstawiony/zmieniony
      };

      connection.invoke("PushUpdate", documentId, JSON.stringify(changeSet));
      console.log("handleEditorChange", JSON.stringify(changeSet));
    }
  };

  return (
    <CodeMirror
      ref={editorRef}
      value={documentContent}
      options={{
        mode: "javascript",
        lineNumbers: true,
      }}
      onBeforeChange={(editor, data, value) => {
        console.log(1);
        setDocumentContent(value);
        handleEditorChange(editor, data, value);
      }}
    />
  );
};

export default CollaborativeEditor;
