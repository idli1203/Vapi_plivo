const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.json({
        url: `wss://vapiplivo-production.up.railway.app/audiostream`
    });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/audiostream" });

const MIN_CHUNK_SIZE = 3200;
const MAX_CHUNK_SIZE = 100000;
const CHUNK_MULTIPLE = 320;

function getNextChunkSize(bufferLength) {

    let size = Math.min(MAX_CHUNK_SIZE, bufferLength);
    size -= size % CHUNK_MULTIPLE;
    if (size < MIN_CHUNK_SIZE) return 0;

    return size;
}

wss.on('connection', (ws) => {
    console.log("WebSocket client connected. Waiting 10 seconds...");

    ws.on('message', (data) => {
        console.log("[Received from client]:");
        try {
            const decoded = data.toString();
            const json = JSON.parse(decoded);
            console.log("Parsed JSON:", json);
        } catch (err) {
            console.log("Raw:", data.toString().slice(0, 100));
        }
    });

        console.log("Starting audio stream...");
        const audioPath = 'Education - Lead Verification and Mining.wav'; 

        if (!fs.existsSync(audioPath)) {
            console.error("Audio file not found:", audioPath);
            ws.send("Error: Audio file not found.");
            ws.close();
            return;
        }

        const audioStream = fs.createReadStream(audioPath);
        let count = 0; 
        let buffer = Buffer.alloc(0);

        audioStream.on('data', (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);
        
            while (buffer.length >= MIN_CHUNK_SIZE) {
                const chunkSize = getNextChunkSize(buffer.length);
                if (chunkSize === 0) break;
        
                const chunkToSend = buffer.subarray(0, chunkSize); // replaced slice
                buffer = buffer.subarray(chunkSize);               // replaced slice
        
                if (ws.readyState === WebSocket.OPEN) {
                    const encodedchunkToSend = chunkToSend.toString('base64'); 
                    ws.send(encodedchunkToSend);
                    count++; 
                }
            }
        });
        
        audioStream.on('end', () => {
            if (buffer.length >= MIN_CHUNK_SIZE) {
                const chunkSize = getNextChunkSize(buffer.length);
                const chunkToSend = buffer.subarray(0, chunkSize); // replaced slice
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(chunkToSend.toString('base64'));
                }
            }
            console.log("Finished streaming audio.");
            console.log(`\n count: ${count}`)
            ws.close();
        });
        
    ws.on('close', () => console.log("Client disconnected"));
    ws.on('error', (error) => console.error("WebSocket error:", error));
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`WebSocket endpoint available at ws://localhost:${port}/audiostream`);
});
