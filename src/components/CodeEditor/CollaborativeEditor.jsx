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
  

  const [isLocalChanges, setIsLocalChanges] = useState(false);

  useEffect(() => {
    const connect = async () => {
      const newConnection = new HubConnectionBuilder()
        .withUrl("http://localhost:5555/codesharehub", {
          withCredentials: false,
        })
        .withAutomaticReconnect()
        .build();

      newConnection.on("ReceiveDocument", (doc, changes) => {
        setDocumentContent(doc);
      });

      newConnection.on("ReceiveUpdate", (changeSetJson) => {
        const changeSet = JSON.parse(changeSetJson);
        isLocalChanges.current = true;
        const updatedDoc = applyChangeSet(
          documentContentRef.current,
          changeSet
        );

        console.log(
          "ReceiveUpdate",
          updatedDoc,
          "changeSetJson: ",
          changeSetJson
        );

        setDocumentContent(updatedDoc);
        //documentContentRef.current = updatedDoc;
        
        isLocalChanges.current = false;
      });

      await newConnection.start();
      await newConnection.invoke("JoinDocument", documentId);
      await newConnection.invoke("SubscribeDocument", documentId);

      setConnection(newConnection);
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
console.log("dupa", documentContent);
  }, [isLocalChanges]);

  const applyChangeSet = (doc, changeSet) => {
    const newChanges =
      doc.substring(0, changeSet.Start) +
      changeSet.Text +
      doc.substring(changeSet.Start + changeSet.Length);

    console.log("applyChangeSet", doc, changeSet, newChanges);

    return newChanges;
  };

  const handleEditorChange = (editor, data, value) => {
    if (isLocalChanges.current == true) return;

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
    }

    console.log("handleEditorChange", documentContent);
    // setDocumentContent(documentContent);
  };

  return (
    <CodeMirror
      value={documentContent}
      options={{
        mode: "javascript",
        lineNumbers: true,
      }}
      onBeforeChange={(editor, data, value) => {
        setDocumentContent(value);
      }}
      onChange={handleEditorChange}
    />
  );
};

export default CollaborativeEditor;
