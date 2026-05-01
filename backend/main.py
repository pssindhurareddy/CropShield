import os
import json
import base64
from io import BytesIO
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import socketio
import joblib
import tensorflow as tf
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# Setup FastAPI App
app = FastAPI(title="CropShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Socket.IO for the frontend Dashboard
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Load Models
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'cropshield_models')

# CNN Model
try:
    cnn_model = tf.keras.models.load_model(os.path.join(MODEL_DIR, 'cropshield_cnn_best.keras'))
except Exception as e:
    print(f"Warning: Could not load CNN model: {e}")
    cnn_model = None

# Random Forest Model and Encoder
try:
    rf_model = joblib.load(os.path.join(MODEL_DIR, 'cropshield_rf.joblib'))
    label_encoder = joblib.load(os.path.join(MODEL_DIR, 'cropshield_label_encoder.joblib'))
except Exception as e:
    print(f"Warning: Could not load RF model/encoder: {e}")
    rf_model = None
    label_encoder = None

# Names
try:
    with open(os.path.join(MODEL_DIR, 'class_names.json'), 'r') as f:
        class_names = json.load(f)
except Exception as e:
    print(f"Warning: Could not load class names: {e}")
    class_names = []

try:
    with open(os.path.join(MODEL_DIR, 'sensor_feature_names.json'), 'r') as f:
        sensor_feature_names = json.load(f)
except Exception as e:
    print(f"Warning: Could not load sensor features: {e}")
    sensor_feature_names = [
        "soil_temp_c", "soil_moisture_pct", "soil_ph", "nitrogen_ppm",
        "phosphorus_ppm", "potassium_ppm", "ambient_humidity_pct",
        "ambient_temp_c", "light_intensity_lux", "co2_ppm"
    ]

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

device_connected = False
latest_reading = None

# Socket.IO Handlers (Frontend Dashboard)
@sio.event
async def connect(sid, environ):
    print(f"[BACKEND] Dashboard client connected: {sid}")
    if latest_reading:
        await sio.emit('sensorData', latest_reading, to=sid)
    await sio.emit('deviceStatus', {'connected': device_connected}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"[BACKEND] Dashboard client disconnected: {sid}")

# Native WebSocket Endpoint (ESP32)
@app.websocket("/esp32")
async def websocket_esp32(websocket: WebSocket):
    global device_connected, latest_reading
    await websocket.accept()
    print('[BACKEND] ESP32 device connected via WebSocket!')
    device_connected = True
    await sio.emit('deviceStatus', {'connected': True})
    
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                if data.get('type') == 'register':
                    print(f"[BACKEND] Device registered: {data.get('device')}")
                    await websocket.send_text(json.dumps({'type': 'ack', 'message': 'CropShield backend connected'}))
                    continue
                
                # Format to match what frontend expects
                latest_reading = data
                latest_reading['receivedAt'] = data.get('receivedAt', "Unknown") # normally iso timestamp
                
                # Use fallbacks for logging safely
                soil_temp = data.get('soilTemp', data.get('soil_temp_c', '?'))
                print(f"[BACKEND] Received: soilTemp:{soil_temp}°C ...")
                
                # Emit to frontend dashboard
                await sio.emit('sensorData', latest_reading)
            except json.JSONDecodeError:
                print(f'[BACKEND] Bad JSON: {data_str}')
    except WebSocketDisconnect:
        print('[BACKEND] ESP32 device disconnected')
        device_connected = False
        await sio.emit('deviceStatus', {'connected': False})

@app.get("/")
def read_root():
    return {"status": "CropShield backend running", "deviceConnected": device_connected}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/classes")
def get_classes():
    return {"classes": class_names}

@app.post("/analyze")
async def analyze_data(
    image: UploadFile = File(...),
    sensor_data: str = Form(...)
):
    try:
        # 1. Parse Sensor Data
        try:
            sensors = json.loads(sensor_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid sensor data JSON")
        
        # 2. Predict with CNN
        diseases = []
        severity = "Unknown"
        if cnn_model and class_names:
            contents = await image.read()
            pil_img = Image.open(BytesIO(contents)).convert("RGB")
            pil_img = pil_img.resize((224, 224))
            img_array = np.array(pil_img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            predictions = cnn_model.predict(img_array)[0]
            top_3_idx = np.argsort(predictions)[-3:][::-1]
            
            colors = ["#ff1744", "#ffab00", "#00e676"] # Red, Amber, Green roughly for top 3
            for i, idx in enumerate(top_3_idx):
                name = class_names[idx]
                confidence = float(predictions[idx])
                diseases.append({
                    "name": name,
                    "confidence": confidence,
                    "color": colors[i] if i < len(colors) else "#cccccc"
                })
            
            # Determine visual severity based on top prediction
            top_pred_name = diseases[0]['name'].lower()
            if 'healthy' in top_pred_name:
                severity = "Healthy"
            else:
                top_conf = diseases[0]['confidence']
                if top_conf > 0.8:
                    severity = "Critical"
                elif top_conf > 0.5:
                    severity = "High"
                else:
                    severity = "Moderate"
        else:
            diseases = [{"name": "CNN Model Unavailable", "confidence": 0, "color": "#cccccc"}]

        # 3. Predict with Random Forest
        wellness_score = 0
        wellness_label = "Unknown"
        overall_status = "Unknown"
        if rf_model and label_encoder:
            # Construct feature vector based on sensor_feature_names order
            feature_vector = []
            
            def get_val(key_rf):
                mapping = {
                    "soil_temp_c": ["soil_temp_c", "soilTemp"],
                    "soil_moisture_pct": ["soil_moisture_pct", "soilMoist"],
                    "soil_ph": ["soil_ph", "ph"],
                    "nitrogen_ppm": ["nitrogen_ppm", "nitrogen"],
                    "phosphorus_ppm": ["phosphorus_ppm", "phosphorus"],
                    "potassium_ppm": ["potassium_ppm", "potassium"],
                    "ambient_humidity_pct": ["ambient_humidity_pct", "airHumidity"],
                    "ambient_temp_c": ["ambient_temp_c", "airTemp"],
                    "light_intensity_lux": ["light_intensity_lux", "light"],
                    "co2_ppm": ["co2_ppm", "co2"]
                }
                keys_to_check = mapping.get(key_rf, [key_rf])
                for k in keys_to_check:
                    if k in sensors:
                        return float(sensors[k])
                return 0.0 # Default if missing
                
            for fname in sensor_feature_names:
                feature_vector.append(get_val(fname))
                
            rf_pred = rf_model.predict([feature_vector])
            wellness_label = label_encoder.inverse_transform(rf_pred)[0]
            
            # Create a mock wellness score based on the label for the UI
            label_scores = {
                "Healthy": 90,
                "Early_Stress": 75,
                "Water_Stressed": 50,
                "Nutrient_Deficient": 45,
                "Critical": 20
            }
            wellness_score = label_scores.get(wellness_label, 50)
            overall_status = "Optimal" if wellness_label == "Healthy" else "At Risk"

        # 4. Call Claude for Treatments
        treatments = []
        if anthropic_client.api_key:
            prompt = f"""You are CropShield, an AI agricultural expert. 
Based on the following analysis, provide exactly 3 brief treatment recommendations.
- Top Visual Diagnosis: {diseases[0]['name'] if diseases else 'Unknown'}
- Environmental Health: {wellness_label}
- Sensor Data: {json.dumps(sensors)}

Respond ONLY with a valid JSON array matching this format precisely (no markdown formatting, no backticks, no other text):
[
  {{"text": "Short Action Name", "detail": "Specific detail/instruction"}},
  {{"text": "Short Action Name", "detail": "Specific detail/instruction"}},
  {{"text": "Short Action Name", "detail": "Specific detail/instruction"}}
]"""
            try:
                message = anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=500,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                response_text = message.content[0].text
                clean_json = response_text.replace('```json', '').replace('```', '').strip()
                treatments = json.loads(clean_json)
            except Exception as e:
                print(f"Anthropic API Error: {e}")
                treatments = [
                    {"text": "System Error", "detail": "Failed to fetch AI recommendations."}
                ]
        else:
            treatments = [
                {"text": "API Key Missing", "detail": "Anthropic API key not configured."}
            ]

        # 5. Return Unified JSON
        return {
            "diseases": diseases,
            "severity": severity,
            "wellnessScore": wellness_score,
            "wellnessLabel": wellness_label,
            "treatments": treatments,
            "overallStatus": overall_status
        }
    except Exception as e:
        print(f"Error in /analyze: {e}")
        raise HTTPException(status_code=500, detail=str(e))
