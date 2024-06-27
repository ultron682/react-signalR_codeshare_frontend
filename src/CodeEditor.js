import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import queryString from 'query-string';

const CodeEditor = () => {
    const [code, setCode] = useState('');
    const [connection, setConnection] = useState(null);
    const [uniqueId, setUniqueId] = useState('');

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
            .withUrl('http://localhost:5555/codesharehub', {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected!');

                    if (uniqueId) {
                        connection.invoke('GetCode', uniqueId)
                            .then(initialCode => {
                                setCode(initialCode);
                            });

                        connection.on('ReceiveCode', (receivedId, code) => {
                            if (receivedId === uniqueId) {
                                setCode(code);
                            }
                        });
                    }
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection, uniqueId]);

    const sendCode = async (code) => {
        if (connection.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.send('SendCode', uniqueId, code);
            } catch (e) {
                console.log(e);
            }
        } else {
            alert('No connection to server yet.');
        }
    };

    const handleCodeChange = (event) => {
        setCode(event.target.value);
        sendCode(event.target.value);
    };

    const generateUniqueId = () => {
        return 'xxxxx'.replace(/x/g, () => {
            return Math.floor(Math.random() * 16).toString(16);
        });
    };

    return (
        <textarea value={code} onChange={handleCodeChange} rows="20" cols="80" />
    );
};

export default CodeEditor;
