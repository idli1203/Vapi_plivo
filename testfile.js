const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send("Received. Connect via WebSocket at ws://localhost:8080/audiostream");
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/audiostream" });

wss.on('connection', (ws) => {
        console.log("WebSocket client connected. Waiting 10 seconds...");
    
        ws.send("Connected to server. Waiting 10 seconds for audio...");
    
        // Optional heartbeat ping to keep connection alive
        const heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
            }
        }, 2000);
    
        setTimeout(() => {
            clearInterval(heartbeat); // stop pinging
    
            console.log("Starting audio stream...");
            const audioPath = path.join(__dirname, 'Mu-law_audio_demo.flac.mp3');
    
            if (!fs.existsSync(audioPath)) {
                console.error("Audio file not found:", audioPath);
                ws.send("Error: Audio file not found.");
                ws.close();
                return;
            }
    
            const audioStream = fs.createReadStream(audioPath);
            audioStream.on('data', (chunk) => {
                ws.send(chunk);
            });
    
            audioStream.on('end', () => {
                console.log("Finished streaming audio.");
                ws.close();
            });
    
        }, 10000); // 10 seconds
    
        ws.on('close', () => console.log("Client disconnected"));
        ws.on('error', (error) => console.error("WebSocket error:", error));
    });  

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket endpoint available at ws://localhost:${port}/audiostream`);
});
