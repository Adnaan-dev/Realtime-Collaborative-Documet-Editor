// server/server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/collab-doc', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// MongoDB Schema
const DocumentSchema = new mongoose.Schema({ content: String });
const Document = mongoose.model("Document", DocumentSchema);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let document = '';

// Load document from DB on server start
Document.findOne().then(doc => {
    if (doc) {
        document = doc.content;
        console.log("📄 Loaded saved document");
    } else {
        console.log("ℹ️ No existing document found in DB");
    }
});

// Function to save document in DB
function saveDocument(content) {
    Document.findOne().then(doc => {
        if (doc) {
            doc.content = content;
            doc.save();
        } else {
            Document.create({ content });
        }
    });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('🟢 Client connected');

    ws.send(JSON.stringify({ type: 'init', data: document }));

    ws.on('message', (msg) => {
        try {
            const parsed = JSON.parse(msg);

            if (parsed.type === 'update') {
                document = parsed.data;
                saveDocument(document); // Save to DB

                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', data: document }));
                    }
                });
            }

            if (parsed.type === 'typing') {
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'typing' }));
                    }
                });
            }

        } catch (err) {
            console.error('❌ Message error:', err);
        }
    });

    ws.on('close', () => console.log('🔴 Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
