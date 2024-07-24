import React, { useState, useEffect, useContext } from "react";
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

const CodeEditor = () => {
  const {
    t,
    i18n: { changeLanguage, language },
  } = useTranslation();

  const [code, setCode] = useState("");
  const [connection, setConnection] = useState(null);
  const [uniqueId, setUniqueId] = useState("");
  const [languageProg, setLanguageProg] = useState("javascript");
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const { theme } = useTheme();

  const [lastActionTime, setLastActionTime] = useState(null);
  const [timer, setTimer] = useState(null);

  const handleAction = () => {
    // Aktualizuj czas ostatniego wywołania
    setLastActionTime(Date.now());

    // Wywołaj jakąś akcję
    console.log("Action executed");
  };

  useEffect(() => {
    // Czyść poprzedni timer, jeśli istnieje
    if (timer) {
      clearTimeout(timer);
    }

    // Ustaw nowy timer, który wywoła performDelayedAction po 1 sekundzie
    const newTimer = setTimeout(() => {
      if (Date.now() - lastActionTime >= 1000) {
        performDelayedAction();
      }
    }, 1000);

    setTimer(newTimer);

    // Czyść timer przy unmount lub przy zmianie lastActionTime
    return () => clearTimeout(newTimer);
  }, [lastActionTime]);

  const performDelayedAction = () => {
    // Funkcja, która ma zostać wykonana po 1 sekundzie od ostatniego wywołania handleAction
    console.log("Delayed action executed");
    sendCode(code);
  };

  useEffect(() => {
    console.log(id);
    if (id) {
      setUniqueId(id);
    } else {
    }
  }, [id, navigate]);

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
    if (connection) {
      connection
        .start()
        .then((result) => {
          console.log("Connected!");
          setIsConnected(true);
          setCode("Loading...");

          if (uniqueId) {
            connection.invoke("GetCode", uniqueId).then((code) => {
              setCode(code);
            });

            connection.on("ReceiveCode", (receivedId, code) => {
              if (receivedId === uniqueId) {
                setCode(code);
              }
            });
          }
        })
        .catch((e) => {
          setIsConnected(false);
          console.log("Connection failed: ", e);
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

  const sendCode = async (code) => {
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
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };

  const handleCodeChange = (editor, data, value) => {
    setCode(value);
    // sendCode(value);
    handleAction();
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguageProg(selectedLanguage);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <>
      <div
        className={theme === "light" ? "toolsBar-light" : "toolsBar-dark"}
        style={{ marginBottom: 10 }}
      >
        <label htmlFor="languageSelect">{t("lang")}</label>
        <select
          id="languageSelect"
          onChange={handleLanguageChange}
          value={languageProg}
        >
          <option value="javascript">JavaScript</option>
          <option value="xml">XML</option>
          <option value="css">CSS</option>
        </select>
      </div>

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
        value={code}
        options={{
          mode: languageProg,
          theme: "material",
          lineNumbers: true,
          readOnly: !isConnected ? "nocursor" : false,
        }}
        onBeforeChange={handleCodeChange}
        minHeight="100vh"
        height="100vh"
      />
    </>
  );
};

export default CodeEditor;
