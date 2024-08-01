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

import { useTheme } from "../ThemeContext";
import "./CodeEditor.css";
import { AuthContext } from "../AuthContext";
import LoadingPopup from "../LoadingPopup";
import CodeDownloader from "./CodeDownloader";
import { BounceLoader } from "react-spinners";

import { v4 as uuidv4 } from "uuid";

var ignoreEventBecauseIAmTriggeringIt = false;

const CodeEditor = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // const editor = useRef(null);
  const clientIdRef = useRef(uuidv4());
  const localChangeRef = useRef(false); // Track local changes
  const timeoutRef = useRef(null);

  const [codeContent, setCodeContent] = useState({
    code: "",
    fromOtherUser: false,
  });

  const savedCodeContent = useRef({
    code: "",
    fromOtherUser: false,
  });

  // const latestCodeContent = useRef(codeContent); //always newest codeContent due to setTimeout
  // const latestSavedCodeContent = useRef(savedCodeContent);

  const [connection, setConnection] = useState(null);
  const connectionRef = useRef(null);

  const [uniqueId, setUniqueId] = useState("");
  const [languageProg, setLanguageProg] = useState("javascript");
  const [isConnected, setIsConnected] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const [timer, setTimer] = useState(null);
  const [changes, setChanges] = useState([]);
  const changesRef = useRef(changes);
  changesRef.current = changes;

  const [changesApplied, setChangesApplied] = useState([]);
  const changesAppliedRef = useRef(changesApplied);

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

  // const updateLineInSnippet = async (lineNumber, newLineContent) => {
  //   if (connection === null) {
  //     return;
  //   }

  //   if (connection.state === signalR.HubConnectionState.Connected) {
  //     try {
  //       await connection.invoke(
  //         "UpdateSnippetLine",
  //         uniqueId,
  //         user !== null ? user.id : "",
  //         lineNumber,
  //         newLineContent
  //       );

  //       setIsSaved(true);
  //       savedCodeContent.current = codeContent;
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   } else {
  //     alert("No connection to server yet.");
  //   }
  // };

  // const codeContentRef = useRef(codeContent);

  // useEffect(() => {
  //   codeContentRef.current = codeContent;
  // }, [codeContent]);

  // const checkLinesInCodeChange = () => {
  //   const newCodeLines = codeContentRef.current.code.split("\n");
  //   const oldCodeLines = savedCodeContent.current.code.split("\n");

  //   console.log(oldCodeLines);
  //   console.log(newCodeLines);

  //   for (let i = 0; i < newCodeLines.length; i++) {
  //     if (newCodeLines[i] !== oldCodeLines[i]) {
  //       console.log(
  //         "Changed line: " +
  //           i +
  //           "  " +
  //           JSON.stringify(oldCodeLines[i]) +
  //           " : " +
  //           JSON.stringify(newCodeLines[i])
  //       );
  //       updateLineInSnippet(i, newCodeLines[i]);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (!connection || !isConnected || codeContent.fromOtherUser === true)
  //     return;

  //   // console.log("on codeContent change: " + codeContent.code);

  //   setCodeContent(codeContent);
  //   setIsSaved(false);

  //   if (timer) {
  //     clearTimeout(timer);
  //   }

  //   const newTimer = setTimeout(() => {
  //     checkLinesInCodeChange();
  //     clearTimeout(timer);
  //     setTimer(null);
  //   }, 2000);

  //   setTimer(newTimer);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [codeContent]);

  // const onReceivedNewLineCode = (lineNumber, newLine) => {
  //   console.log("Received line: " + lineNumber + " " + newLine);

  //   setCodeContent((prevCodeContent) => {
  //     const splittedCode = prevCodeContent.code.split("\n");
  //     splittedCode[lineNumber] = newLine;
  //     const newJoinedCode = splittedCode.join("\n");
  //     console.log("New joined code:", newJoinedCode);

  //     const updatedCodeContent = {
  //       ...prevCodeContent,
  //       code: newJoinedCode,
  //       fromOtherUser: true,
  //     };

  //     savedCodeContent.current = updatedCodeContent;
  //     console.log("Updated code content:", updatedCodeContent);
  //     return updatedCodeContent;
  //   });
  // };

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
              .then((res) => {
                // if (res !== null) {
                //   res.code = res.code.replace(/(?:\r\n|\r|\n)/g, "\n");
                //   console.log(JSON.stringify(res.code));

                //   // setCodeContent({
                //   //   ...codeContent,
                //   //   code: res.code,
                //   //   fromOtherUser: true,
                //   // });

                //   // savedCodeContent.current = {
                //   //   ...codeContent,
                //   //   code: res.code,
                //   //   fromOtherUser: true,
                //   // };

                //   setLanguageProg(res.selectedLang.name);
                // }

                // connection.on("ReceivedNewLineCode", (lineNumber, newLine) =>
                //   onReceivedNewLineCode(lineNumber, newLine)
                // );

                connection.on("ReceiveCodeUpdate", (metadataList) => {
                  // Ignore changes from this client
                  if (metadataList[0]?.clientId !== clientIdRef.current) {
                    applyChanges(metadataList);
                  }
                });

                setIsConnected(true);
              })
              .catch((err) => {
                console.error(err);
                setIsConnected(false);
              });
          }

          connectionRef.current = connection;
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
        connection.off("ReceivedNewLineCode");
      }
    };
  }, [connection, uniqueId]);

  const handleLanguageProgChange = (event) => {
    setLanguageProg(event.target.value);
  };

  const applyChanges = (metadataList) => {
    console.log("applyChanges: ", metadataList);

    ignoreEventBecauseIAmTriggeringIt = true;

    const editor = document.querySelector(".CodeMirror").CodeMirror;
    localChangeRef.current = true;
    metadataList.forEach((metadata) => {
      editor.replaceRange(metadata.text.join("\n"), metadata.from, metadata.to);
    });

    // ignoreEventBecauseIAmTriggeringIt = false;
  };

  const handleCodeChange = (metadata) => {
    if (ignoreEventBecauseIAmTriggeringIt) {
      return;
    }

    console.log("handleCodeChange: ", metadata);

    // Add change to the list of changes
    setChanges((prevChanges) => [
      { ...metadata, clientId: clientIdRef.current, changeId: uuidv4() },
      ...prevChanges,
    ]);

    // Clear the timeout if it's set
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to send the changes after 500ms
    timeoutRef.current = setTimeout(() => {
      connectionRef.current.invoke("SendCodeUpdate", changesRef.current);
      console.log("SendCodeUpdate: ", changesRef.current);
      setChanges([]);
    }, 500);
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
          data={codeContent.code}
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

      <CodeMirror
        editorDidMount={(editor) => {
          editor.current = editor;
        }}
        editorWillUnmount={(editor) => {
          editor.current = null;
        }}
        value={codeContent.code}
        options={{
          mode: languageProg,
          theme: theme === "light" ? "material" : "material-darker",
          lineNumbers: true,
          lineWrapping: true,
          readOnly: !isConnected ? "nocursor" : false,
        }}
        onBeforeChange={(editor, metadata, value) => {
          setCodeContent({ code: value, fromOtherUser: false });
        }}
        onChange={(editor, metadata, value) => {
          //console.log(metadata);
          handleCodeChange(metadata);
        }}
        minHeight="100%"
        height="100%"
      />
    </div>
  );
};

export default CodeEditor;
