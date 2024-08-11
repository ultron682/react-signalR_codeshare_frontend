import React, { useEffect, useRef, useState } from 'react';
import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Text } from '@codemirror/state';
import { collab, receiveUpdates, sendableUpdates, getSyncedVersion } from '@codemirror/collab';
import { ChangeSet } from '@codemirror/state';
import * as signalR from '@microsoft/signalr';

const CollaborativeEditor = () => {
  const editor = useRef(null);
  const [view, setView] = useState(null);
  const [connection, setConnection] = useState(null);
  const docId = "default";

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5555/codesharehub", {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

      newConnection.on("ReceiveDocument", (doc, changes) => {
        setDocumentContent(doc);
      });

      newConnection.on("ReceiveUpdate", (changeSetJson) => {
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

        //documentContentRef.current = updatedDoc;
        console.log(3);
        setDocumentContent(updatedDoc);

        //setisServerChange(false);
      });

      await newConnection.start();
      await newConnection.invoke("JoinDocument", documentId);
      await newConnection.invoke("SubscribeDocument", documentId);

      setConnection(newConnection);
    };

    startEditor();

    return () => {
      if (view) view.destroy();
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on("ReceiveUpdate", (docId, clientId, changes) => {
            if (view) {
              const updates = [{ clientID: clientId, changes: ChangeSet.fromJSON(changes) }];
              view.dispatch(receiveUpdates(view.state, updates));
            }
          });

          connection.invoke("GetDocument", docId)
            .then(doc => {
              if (view) {
                view.dispatch({
                  changes: { from: 0, to: view.state.doc.length, insert: doc }
                });
              }
            });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection, view]);

  return <div ref={editor}></div>;
};

function peerExtension(connection) {
  return ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.view = view;
        this.pushing = false;
        this.done = false;
        this.pull();
      }

      update(update) {
        if (update.docChanged) this.push();
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        const changes = updates.map(u => u.changes.toJSON());
        await connection.invoke("SendUpdate", "default", "client1", changes);
        this.pushing = false;
        if (sendableUpdates(this.view.state).length) setTimeout(() => this.push(), 100);
      }

      async pull() {
        // Not used with SignalR, as the server pushes updates
      }

      destroy() {
        this.done = true;
      }
    }
  );
}

export default CollaborativeEditor;
