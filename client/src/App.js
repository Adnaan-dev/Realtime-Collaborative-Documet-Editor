// src/App.js
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

function App() {
    const [document, setDocument] = useState("");
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:5000');
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('WebSocket connection established');
        };

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'init' || message.type === 'update') {
                    setDocument(message.data);
                } else if (message.type === 'typing') {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 1000);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            newSocket.close();
        };
    }, []);

    const handleChange = (e) => {
        const newDocument = e.target.value;
        setDocument(newDocument);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'update', data: newDocument }));
            socket.send(JSON.stringify({ type: 'typing' }));
        }
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className={`app-container ${theme}`}>
            <Navbar toggleTheme={toggleTheme} theme={theme} />
            <div className="editor-container">
                <h2>Write you document here !</h2>
                <textarea
                    value={document}
                    onChange={handleChange}
                    rows="20"
                    cols="80"
                />
                {isTyping && <p className="typing-indicator">Someone is typing...</p>}
            </div>
            <Footer />
        </div>
    );
}

export default App;
