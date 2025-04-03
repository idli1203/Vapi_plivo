// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const fs = require('fs');

// const app = express();
// const port = 8080;

// const PUBLIC_WS_URL = "wss://vapiplivo-production.up.railway.app/audiostream";
// const PUBLIC_URL = "https://vapiplivo-production.up.railway.app/receive_call/";


// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });


// wss.on('connection', (ws) => {
//     console.log("WebSocket client connected. Waiting for 10 seconds...");

//     setTimeout(() => {  
//         console.log("Starting audio stream...");

//         const audioStream = fs.createReadStream('sample.pcm'); 
//         audioStream.on('data', (chunk) => {
//             ws.send(chunk);
//         });

//         audioStream.on('end', () => {
//             console.log("Finished streaming audio.");
//             ws.close();
//         });

//     }, 10000); 

//     ws.on('close', () => console.log("Client disconnected"));
//     ws.on('error', (error) => console.error("WebSocket error:", error));
// });


// app.get('/receive_call/', (req, res) => {
//     const xmlData = `
//       <Response>
//         <Stream bidirectional="true" keepCallAlive="true">
//           ${PUBLIC_WS_URL}
//         </Stream>
//       </Response>
//     `;

//     res.set('Content-Type', 'application/xml');
//     res.send(xmlData);
// });



// server.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });
var plivo = require('plivo');
var express = require('express');
var app = express();

app.all('/receive_call/', function(req, res) {
    var response = plivo.Response();
    var speak_body = "Hello, you just received your first call";
    response.addSpeak(speak_body);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(response.toXML());
})

app.set('port', (process.env.PORT || 8080));
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});