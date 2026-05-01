const WebSocket = require('ws');

const WS_URL = 'https://crop-shield-wine.vercel.app';

let ws;
let connected = false;

// Sensor state
let sensors = {
  soilTemp: 26.5,
  soilMoist: 62.0,
  ph: 6.4,
  nitrogen: 45.0,
  phosphorus: 28.0,
  potassium: 35.0,
  airTemp: 28.0,
  airHumidity: 65.0,
  light: 12000
};

// Sensor ranges and walk steps
const sensorConfig = {
  soilTemp: { min: 15, max: 40, step: 0.3 },
  soilMoist: { min: 20, max: 90, step: 1.2 },
  ph: { min: 5.0, max: 8.5, step: 0.05 },
  nitrogen: { min: 10, max: 100, step: 1.5 },
  phosphorus: { min: 5, max: 60, step: 0.8 },
  potassium: { min: 10, max: 70, step: 0.9 },
  airTemp: { min: 15, max: 42, step: 0.2 },
  airHumidity: { min: 20, max: 95, step: 0.8 },
  light: { min: 0, max: 80000, step: 500 }
};

function randomWalk(val, min, max, step) {
  const delta = (Math.random() - 0.48) * step;
  val += delta;
  return Math.max(min, Math.min(max, val));
}

function connect() {
  console.log('[SIMULATOR] Connecting to backend...');
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('[SIMULATOR] Connected to backend!');
    connected = true;
    ws.send(JSON.stringify({
      type: 'register',
      device: 'ESP32-CropShield-01'
    }));
  });

  ws.on('message', (data) => {
    console.log('[SIMULATOR] Server:', data.toString());
  });

  ws.on('close', () => {
    console.log('[SIMULATOR] Disconnected. Retrying in 3 seconds...');
    connected = false;
    setTimeout(connect, 3000);
  });

  ws.on('error', (error) => {
    console.error('[SIMULATOR] WebSocket error:', error.message);
  });
}

function sendSensorData() {
  if (!connected) return;

  // Update sensor values with random walk
  Object.keys(sensors).forEach(key => {
    const config = sensorConfig[key];
    sensors[key] = randomWalk(sensors[key], config.min, config.max, config.step);
  });

  const payload = {
    device: 'ESP32-CropShield-01',
    soilTemp: Math.round(sensors.soilTemp * 10) / 10,
    soilMoist: Math.round(sensors.soilMoist * 10) / 10,
    ph: Math.round(sensors.ph * 10) / 10,
    nitrogen: Math.round(sensors.nitrogen),
    phosphorus: Math.round(sensors.phosphorus),
    potassium: Math.round(sensors.potassium),
    airTemp: Math.round(sensors.airTemp * 10) / 10,
    airHumidity: Math.round(sensors.airHumidity * 10) / 10,
    light: Math.round(sensors.light),
    timestamp: Date.now()
  };

  ws.send(JSON.stringify(payload));
  console.log(`[TX] soilTemp:${payload.soilTemp}°C | moisture:${payload.soilMoist}% | pH:${payload.ph} | N:${payload.nitrogen}ppm`);
}

console.log('[SIMULATOR] CropShield ESP32 Simulator starting...');
connect();

// Send data every 2 seconds
setInterval(sendSensorData, 2000);