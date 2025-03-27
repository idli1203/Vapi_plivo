const WebSocket = require('ws');
const fs = require('fs');

let pcmBuffer = Buffer.alloc(0);

const ws = new WebSocket("wss://aws-us-west-2-production1-phone-call-websocket.vapi.ai/7420f27a-30fd-4f49-a995-5549ae7cc00d/transport");

ws.on('open', () => console.log('WebSocket connection established'));

ws.on('message', (data, isBinary) => {
  if (isBinary) {
    pcmBuffer = Buffer.concat([pcmBuffer, data]);
    console.log(`Received PCM data, buffer size: ${pcmBuffer.length}`);
  } else {
    console.log('Received message:', JSON.parse(data.toString()));
  }
});

ws.on('close', () => {
  if (pcmBuffer.length > 0) {
    fs.writeFileSync('audio.pcm', pcmBuffer);
    console.log('Audio data saved to audio.pcm');
  }
});

ws.on('error', (error) => console.error('WebSocket error:', error));

