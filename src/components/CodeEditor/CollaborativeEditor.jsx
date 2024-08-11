import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

const CollaborativeEditor = ({ documentId }) => {
    const [connection, setConnection] = useState(null);
    const [documentContent, setDocumentContent] = useState("");
    const editorRef = useRef(null);

    useEffect(() => {
        const connect = async () => {
            const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5555/codesharehub', {
                       withCredentials: false,
                     })
            .withAutomaticReconnect()
            .build();

            newConnection.on("ReceiveDocument", (doc, changes) => {
                setDocumentContent(doc);
            });

            newConnection.on("ReceiveUpdate", (changeSetJson) => {
                const changeSet = JSON.parse(changeSetJson);
                const updatedDoc = applyChangeSet(documentContent, changeSet);
                setDocumentContent(updatedDoc);
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

    const applyChangeSet = (doc, changeSet) => {
        return doc.substring(0, changeSet.Start) + changeSet.Text + doc.substring(changeSet.Start + changeSet.Length);
    };

    const handleEditorChange = (editor, data, value) => {
        if (connection) {
            const start = editor.indexFromPos(data.from);
            const end = editor.indexFromPos(data.to);
            const length = end - start;
    
            const changeSet = {
                Start: start,
                Length: length,
                Text: value.substring(start, start + data.text.join('\n').length)
            };
    
            connection.invoke("PushUpdate", documentId, JSON.stringify(changeSet));
        }
        setDocumentContent(value);
    };
    
    return (
        <CodeMirror
            value={documentContent}
            options={{
                mode: 'javascript',
                lineNumbers: true
            }}
            onBeforeChange={(editor, data, value) => {
                setDocumentContent(value);
            }}
            onChange={handleEditorChange}
        />
    );
};

export default CollaborativeEditor;
