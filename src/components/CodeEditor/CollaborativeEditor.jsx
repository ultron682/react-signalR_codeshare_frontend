import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import * as signalR from "@microsoft/signalr";
// import { Controlled as CodeMirror } from "react-codemirror2";


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
import { AuthContext } from "../AuthContext";
import LoadingPopup from "../LoadingPopup";
import CodeDownloader from "./CodeDownloader";
import { BounceLoader } from "react-spinners";

import CollaborativeEditor from './CollaborativeEditor';


const CodeEditor = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const clientId = useRef(`client_${Math.random().toString(36).substr(2, 9)}`);
  const version = useRef(0);
  const editorRef = useRef();

  const [codeContent, setCodeContent] = useState("");

  const [connection, setConnection] = useState(null);
  const connectionRef = useRef(null);

  const [uniqueId, setUniqueId] = useState("");
  const [languageProg, setLanguageProg] = useState("javascript");
  const [isConnected, setIsConnected] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  const { user } = useContext(AuthContext);

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

  // useEffect(() => {
  //   const newConnection = new signalR.HubConnectionBuilder()
  //     .withUrl("http://localhost:5555/codesharehub", {
  //       withCredentials: false,
  //     })
  //     .withAutomaticReconnect()
  //     .build();

  //   setConnection(newConnection);
  // }, []);

  // useEffect(() => {
  //   if (
  //     connection &&
  //     connection.state === signalR.HubConnectionState.Disconnected
  //   ) {
  //     connection
  //       .start()
  //       .then(() => {
  //         console.log("Connected!");

  //         // connection.on("ReceiveUpdate", (update) => {
  //         //   const changes = ChangeSet.fromJSON(update.changes);
  //         //   receiveUpdates(view, [changes]);
  //         //   version = update.version;
  //         // });

  //         // connection.on("InitialState", (data) => {
  //         //   const updates = data.updates.map((update) =>
  //         //     ChangeSet.fromJSON(update.changes)
  //         //   );
  //         //   version = data.version;
  //         //   receiveUpdates(view, updates);
  //         // });

  //         // connectionRef.current = connection;

  //         // connection.invoke("GetInitialState");
  //       })
  //       .catch((e) => {
  //         setIsConnected(false);
  //         // console.log("Connection failed: ", e);
  //       });

  //     connection.onreconnected(() => {
  //       console.log("Connection reestablished.");
  //       setIsConnected(true);
  //     });

  //     connection.onclose(() => {
  //       console.log("Connection closed.");
  //       setIsConnected(false);
  //     });

  //     connection.onreconnecting(() => {
  //       console.log("Connection lost, reconnecting.");
  //       setIsConnected(false);
  //     });
  //   }
  //   return () => {
  //     if (connection) {
  //       console.log("Connection closed ReceivedNewLineCode.");
  //       connection.off("ReceivedNewLineCode");
  //     }
  //   };
  // }, [connection, uniqueId]);

  const handleLanguageProgChange = (event) => {
    setLanguageProg(event.target.value);
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

        <CodeDownloader filename={uniqueId} data={codeContent}></CodeDownloader>

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

     <CollaborativeEditor documentId="dupa"></CollaborativeEditor>
    </div>
  );
};

export default CodeEditor;
