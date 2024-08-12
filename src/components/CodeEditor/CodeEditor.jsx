import React, { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import * as signalR from "@microsoft/signalr";

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

import { useTheme } from "../ThemeContext";
import "./CodeEditor.css";
// import { AuthContext } from "../AuthContext";
// import LoadingPopup from "../LoadingPopup";
import CodeDownloader from "./CodeDownloader";
import { BounceLoader } from "react-spinners";
import CollaborativeEditor from "./CollaborativeEditor";

const CodeEditor = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [documentContent, setDocumentContent] = useState("");
  const documentContentRef = useRef(documentContent);
  documentContentRef.current = documentContent;

  const [connection, setConnection] = useState(null);

  const isServerChangeRef = useRef(false);

  const [uniqueId, setUniqueId] = useState("temp");
  const [languageProg, setLanguageProg] = useState("javascript");
  const [isConnected, setIsConnected] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  // const { user } = useContext(AuthContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const optionsLang = [
    "javascript",
    "xml",
    "css",
    "go",
    "php",
    "python",
    "sql",
    "swift",
  ];

  useEffect(() => {
    if (id) {
      setUniqueId(id);
    } else {
    }
  }, [id, navigate]);

  useEffect(() => {
    const connect = async () => {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5555/codesharehub", {
          withCredentials: false,
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    };

    connect();
  }, []);

  useEffect(() => {
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Disconnected
    ) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");

          connection.on("ReceiveDocument", (doc, changes) => {
            setDocumentContent(doc);
          });

          connection.on("ReceiveUpdate", (changeSetJson) => {
            isServerChangeRef.current = true;

            const changeSet = JSON.parse(changeSetJson);

            const updatedDoc = applyChangeSet(
              documentContentRef.current,
              changeSet
            );

            console.log(
              "updatedDoc:",
              updatedDoc,
              "changeSetJson: ",
              changeSetJson
            );

            console.log(3);

            setDocumentContent(updatedDoc);
          });

          connection.invoke("JoinDocument", uniqueId);
          connection.invoke("SubscribeDocument", uniqueId);

          setConnection(connection);
        })
        .catch((e) => {
          setIsConnected(false);
          // console.log("Connection failed: ", e);
        });

      connection.onreconnected(() => {
        console.log("Connection reestablished.");
        setIsConnected(true);
      });

      connection.onclose(() => {
        console.log("Connection closed.");
        setIsConnected(false);
      });

      connection.onreconnecting(() => {
        console.log("Connection lost, reconnecting.");
        
        setIsConnected(false);
      });
    }
    return () => {
      if (connection) {
        console.log("Connection closed ReceivedNewLineCode.");
        connection.off("ReceiveUpdate");
        connection.off("ReceiveDocument");
        connection.invoke("UnsubscribeDocument", uniqueId);
        
      }
    };
  }, [connection, uniqueId]);

  const handleLanguageProgChange = (event) => {
    setLanguageProg(event.target.value);
  };

  const applyChangeSet = (doc, changeSet) => {
    let newChanges = undefined;

    if (changeSet.Text === "") {
      newChanges =
        doc.substring(0, changeSet.Start) +
        changeSet.Text +
        doc.substring(changeSet.Start + changeSet.Length);
    } else {
      newChanges =
        doc.substring(0, changeSet.Start) +
        changeSet.Text +
        doc.substring(changeSet.Start + changeSet.Length);
    }
    //console.log("applyChangeSet", doc, changeSet, newChanges);

    return newChanges;
  };

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
        Text: data.text.join("\n"),
      };

      connection.invoke("PushUpdate", uniqueId, JSON.stringify(changeSet));
      console.log("handleEditorChange", JSON.stringify(changeSet));
    }
  };

  return (
    <div className="CodeEditorContainer">
      <div
        className={
          "toolsBar " + (theme === "light" ? "toolsBar-light" : "toolsBar-dark")
        }
      >
        <label htmlFor="languageSelect">{t("lang")}</label>
        <select
          id="languageSelect"
          onChange={handleLanguageProgChange}
          value={languageProg}
        >
          {optionsLang.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <CodeDownloader
          filename={uniqueId}
          data={documentContent}
        ></CodeDownloader>

        {<BounceLoader loading={!isSaved} size="20px" color="white" />}
      </div>
      {/* {!isConnected && <LoadingPopup />} */}
      {!isConnected && (
        <div className="noConnection__container">
          <span>{t("noConnection")}</span>
          <button onClick={() => window.location.reload()}>
            {t("refresh")}
          </button>
        </div>
      )}

      <CollaborativeEditor
        languageProg={languageProg}
        documentContent={documentContent}
        setDocumentContent={setDocumentContent}
        theme={theme}
        onHandleEditorChange={handleEditorChange}
        isConnected={isConnected}
      ></CollaborativeEditor>
    </div>
  );
};

export default CodeEditor;
