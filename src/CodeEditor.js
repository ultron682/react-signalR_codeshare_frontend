import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const CodeEditor = () => {
    const [code, setCode] = useState('');
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5555/codesharehub')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected!');

                    // connection.on('', code => {
                    //     console.log('Received previous code: ', code);
                    //     setCode(code);
                    // });

                    connection.on('ReceiveCode', code => {
                        console.log('Received code: ', code);
                        setCode(code);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    const sendCode = async (code) => {
        if (connection.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.send('SendCode', code);
                //alert('sent');
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

    return (
        <textarea value={code} onChange={handleCodeChange} rows="20" cols="80" />
    );
};

export default CodeEditor;
