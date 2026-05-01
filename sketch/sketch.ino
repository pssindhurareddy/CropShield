#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASS ""
#define WS_HOST "localhost"
#define WS_PORT 3000
#define WS_PATH "/esp32"

#define DHT_PIN     15
#define DHT_TYPE    DHT22
#define SOIL_MOIST  34
#define PH_PIN      32
#define LDR_PIN     33

DHT dht(DHT_PIN, DHT_TYPE);
WebSocketsClient ws;

bool connected = false;
unsigned long lastSend = 0;
const int SEND_INTERVAL = 2000;

float soilMoist   = 62.0;
float soilTemp    = 26.5;
float phLevel     = 6.4;
float nitrogenPPM = 45.0;
float phosphorus  = 28.0;
float potassium   = 35.0;

float randomWalk(float val, float minV, float maxV, float step) {
  float delta = ((float)random(-100, 100) / 100.0) * step;
  val += delta;
  if (val < minV) val = minV;
  if (val > maxV) val = maxV;
  return val;
}

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("[WS] Connected to backend!");
      connected = true;
      ws.sendTXT("{\"type\":\"register\",\"device\":\"ESP32-CropShield\"}");
      break;
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected. Retrying...");
      connected = false;
      break;
    case WStype_TEXT:
      Serial.printf("[WS] Server: %s\n", payload);
      break;
    default: break;
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n[WiFi] Connected!");
  ws.begin(WS_HOST, WS_PORT, WS_PATH);
  ws.onEvent(onWebSocketEvent);
  ws.setReconnectInterval(3000);
}

void loop() {
  ws.loop();
  if (millis() - lastSend > SEND_INTERVAL) {
    lastSend = millis();
    float airHumidity = dht.readHumidity();
    float airTemp     = dht.readTemperature();
    soilMoist   = randomWalk(soilMoist,   20.0, 90.0,  1.2);
    soilTemp    = randomWalk(soilTemp,     15.0, 40.0,  0.3);
    phLevel     = randomWalk(phLevel,       5.0,  8.5, 0.05);
    nitrogenPPM = randomWalk(nitrogenPPM,  10.0, 100.0, 1.5);
    phosphorus  = randomWalk(phosphorus,    5.0,  60.0, 0.8);
    potassium   = randomWalk(potassium,    10.0,  70.0, 0.9);
    int rawLight = analogRead(LDR_PIN);
    float lux = map(rawLight, 0, 4095, 0, 80000);
    StaticJsonDocument<256> doc;
    doc["device"]      = "ESP32-CropShield-01";
    doc["soilTemp"]    = round(soilTemp * 10) / 10.0;
    doc["soilMoist"]   = round(soilMoist * 10) / 10.0;
    doc["ph"]          = round(phLevel * 10) / 10.0;
    doc["nitrogen"]    = round(nitrogenPPM);
    doc["phosphorus"]  = round(phosphorus);
    doc["potassium"]   = round(potassium);
    doc["airTemp"]     = isnan(airTemp)     ? 28.5 : round(airTemp * 10) / 10.0;
    doc["airHumidity"] = isnan(airHumidity) ? 65.0 : round(airHumidity * 10) / 10.0;
    doc["light"]       = round(lux);
    doc["timestamp"]   = millis();
    String payload;
    serializeJson(doc, payload);
    if (connected) { ws.sendTXT(payload); Serial.println("[TX] " + payload); }
    else { Serial.println("[OFFLINE] " + payload); }
  }
}
