import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import queryString from "query-string";

import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import 'codemirror/mode/javascript/javascript.js';

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [connection, setConnection] = useState(null);
  const [uniqueId, setUniqueId] = useState("");

  useEffect(() => {
    const values = queryString.parse(window.location.search);
    if (values.id) {
      setUniqueId(values.id);
    } else {
      const generatedId = generateUniqueId();
      setUniqueId(generatedId);
      window.history.replaceState(null, null, `?id=${generatedId}`);
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5555/codesharehub", {
        withCredentials: true,
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
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection, uniqueId]);

  const sendCode = async (code) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.send("SendCode", uniqueId, code);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value);
    sendCode(event.target.value);
  };

  const generateUniqueId = () => {
    return "xxxxx".replace(/x/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  };

  return (
    <>
      <CodeMirror
        value={code}
        options={{
          mode: "javascript",
          theme: "material",
          lineNumbers: true,
        }}
        onBeforeChange={(editor, data, value) => {
          setCode(value);
          sendCode(value);
        }}
        // onChange={(editor, data, value) => {
        //   setCode(value);
        //   sendCode(value);
        // }}
      />
    </>
  );
};

export default CodeEditor;
