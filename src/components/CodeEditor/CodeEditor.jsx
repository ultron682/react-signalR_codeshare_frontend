import React, { useState, useEffect, useContext, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/material-darker.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/css/css.js";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import "./CodeEditor.css";
import { AuthContext } from "../AuthContext";
import LoadingPopup from "../LoadingPopup";
import CodeDownloader from "./CodeDownloader";

const CodeEditor = () => {
  const {
    t,
    i18n: { changeLanguage, language },
  } = useTranslation();
  const { theme } = useTheme();

  const [codeContent, setCodeContent] = useState({
    code: "",
    fromOtherUser: false,
  });
  const [connection, setConnection] = useState(null);
  const [uniqueId, setUniqueId] = useState("");
  const [languageProg, setLanguageProg] = useState("javascript");
  const [isConnected, setIsConnected] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (id) {
      setUniqueId(id);
    } else {
    }
  }, [id, navigate]);

  const sendUpdatedCode = () => {
    console.log("sendUpdatedCode: " + codeContent.code);
    sendCodeToServer(codeContent.code);
    clearTimeout(timer);
    setTimer(null);
  };

  useEffect(() => {
    if (!connection || !isConnected || codeContent.fromOtherUser === true)
      return;

    console.log("on codeContent change: " + codeContent.code);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      sendUpdatedCode();
    }, 300);

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
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Disconnected
    ) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");

          // setCodeContent("Loading...");

          if (uniqueId) {
            connection
              .invoke("JoinGroup", uniqueId)
              .then((code) => {
                //console.log("JoinGroup code: " + code);
                setCodeContent({ code: code, fromOtherUser: true });
                setIsConnected(true);

                connection.on("ReceivedCode", (receivedId, code) => {
                  //console.log("Received code: " + code);
                  setCodeContent({ code: code, fromOtherUser: true });
                  setIsConnected(true);
                });
              })
              .catch((err) => console.error(err));
          }
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
  }, [connection, uniqueId]);

  const sendCodeToServer = async (code) => {
    if (connection === null) {
      return;
    }

    if (connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke(
          "BroadcastText",
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

        <CodeDownloader filename={uniqueId} data={codeContent.code}></CodeDownloader>
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
        value={codeContent.code}
        options={{
          mode: languageProg,
          theme:  (theme === "light" ? "material" : "material-darker"),
          lineNumbers: true,
          lineWrapping: true,
          readOnly: !isConnected ? "nocursor" : false,
        }}
        onBeforeChange={(editor, metadata, value) => {
          setCodeContent({ code: value, fromOtherUser: false });
        }}
        minHeight="100%"
        height="100%"
      />
    </>
  );
};

export default CodeEditor;
