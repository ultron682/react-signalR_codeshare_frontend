import React, { useState, useEffect, useContext, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/css/css.js";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import "./CodeEditor.css";
import { AuthContext } from "../AuthContext";
import LoadingPopup from "../LoadingPopup";

const CodeEditor = () => {
  const {
    t,
    i18n: { changeLanguage, language },
  } = useTranslation();

  const [codeContent, setCodeContent] = useState("");
  const [connection, setConnection] = useState(null);
  const [uniqueId, setUniqueId] = useState("");
  const [languageProg, setLanguageProg] = useState("javascript");
  const [isConnected, setIsConnected] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const { theme } = useTheme();

  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (id) {
      setUniqueId(id);
    } else {
    }
  }, [id, navigate]);

  const sendUpdatedCode = () => {
    console.log("timer: " + codeContent);
    sendCodeToServer(codeContent);
    clearTimeout(timer);
    setTimer(null);
  };

  useEffect(() => {
    if (!connection) return;

    console.log("on codeContent change: " + codeContent);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      sendUpdatedCode();
    }, 500);

    setTimer(newTimer);
  }, [codeContent]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5555/codesharehub", {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Disconnected) {
      connection
        .start()
        .then((result) => {
          console.log("Connected!");

          // setCodeContent("Loading...");

          if (uniqueId) {
            connection.invoke("GetCode", uniqueId).then((code) => {
              setCodeContent(code);
              setIsConnected(true);
            });

            connection.on("ReceivedCode", (receivedId, code) => {
              if (receivedId === uniqueId) {
                setCodeContent(code);
                setIsConnected(true);
              }
            });
          }
        })
        .catch((e) => {
          setIsConnected(false);
          // console.log("Connection failed: ", e);
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
  }, [connection, uniqueId]);

  const sendCodeToServer = async (code) => {
    if (connection === null) {
      return;
    }

    if (connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.send(
          "SendCode",
          uniqueId,
          code,
          user !== null ? user.id : ""
        );

        setIsSaved(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };

  const handleLanguageProgChange = (event) => {
    setLanguageProg(event.target.value);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <>
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
          <option value="javascript">JavaScript</option>
          <option value="xml">XML</option>
          <option value="css">CSS</option>
        </select>
        {!isSaved && <div>Is saving</div>}
      </div>
      {!isConnected && <LoadingPopup />}
      {!isConnected && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{t("noConnection")}</span>
          <button
            onClick={refreshPage}
            style={{
              backgroundColor: "#721c24",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            {t("refresh")}
          </button>
        </div>
      )}

      <CodeMirror
        value={codeContent}
        options={{
          mode: languageProg,
          theme: "material",
          lineNumbers: true,
          readOnly: !isConnected ? "nocursor" : false,
        }}
        onBeforeChange={(editor, metadata, value) => {
          setCodeContent(value);
        }}
        minHeight="100%"
        height="100%"
      />
    </>
  );
};

export default CodeEditor;
