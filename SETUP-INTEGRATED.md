# Sign Caption SE365 - Integrated AI Model with Backend

## Overview
This project integrates the AI Model (Flask/Python) with the Node.js Backend, providing a unified API for sign language prediction.

## Architecture
- **Frontend**: HTML files using MediaPipe for hand detection
- **Backend (Node.js)**: Express server on port 8080 that proxies to Flask API
- **AI Model (Flask/Python)**: TensorFlow model server on port 5000

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- pip (Python package manager)

### 1. Backend Setup (Node.js)

```bash
cd "BackEnd & FrontEnd"
npm install
```

This will install:
- express
- axios (for calling Flask API)
- socket.io
- cors
- and other dependencies

### 2. AI Model Setup (Python/Flask)

```bash
cd "AI Model"
pip install flask flask-cors tensorflow numpy scikit-learn
```

### 3. Running the Application

#### Terminal 1: Start Flask AI Model
```bash
cd "AI Model"
python app.py
```
The Flask server will start on `http://localhost:5000`

#### Terminal 2: Start Node.js Backend
```bash
cd "BackEnd & FrontEnd"
npm start
```
The backend will start on `http://localhost:8080`

### 4. Using the Frontend

Open the HTML files in your browser:

#### For Data Collection + Prediction Testing:
- `AI Model/collection.html` - Collect training data and test predictions

#### For Real-time Translation:
- `AI Model/index.html` - Real-time sign language translation

#### Alternative Versions (Backend-linked):
- `AI Model/collection-backend.html`
- `AI Model/index-backend.html`

## API Endpoints

### Backend API (Node.js)
- `POST /api/predictions/predict` - Make a prediction
  - Body: `{ "landmarks": [...] }`
  - Response: `{ "ok": true, "prediction": "word" }`

- `GET /api/predictions/health` - Check AI model availability

### Direct AI Model API (Flask)
- `POST /predict` - Direct prediction (proxied through backend)

## Integration Details

The integration works as follows:

1. **Frontend (HTML)** → Sends landmark data to **Backend API** (`/api/predictions/predict`)
2. **Backend (Node.js)** → Forwards request to **Flask AI Model** (`http://localhost:5000/predict`)
3. **Flask AI Model** → Processes with TensorFlow model → Returns prediction
4. **Backend** → Returns response to **Frontend**

## Configuration

### Backend URL Configuration
The frontend defaults to `http://localhost:8080`. To change it:
```javascript
window.BACKEND_URL = 'http://your-backend-url:8080';
```

### Flask AI Model URL
Configured in `BackEnd & FrontEnd/routes/predictions.js`:
```javascript
const AI_MODEL_URL = process.env.AI_MODEL_URL || 'http://localhost:5000';
```

Set environment variable:
```bash
export AI_MODEL_URL=http://localhost:5000
```

## File Structure

```
Sign Caption SE365/
├── AI Model/
│   ├── app.py                          # Flask AI model server
│   ├── collection.html                 # Data collection + prediction (UPDATED)
│   ├── index.html                      # Real-time translation (UPDATED)
│   ├── collection-backend.html         # Backup version
│   ├── index-backend.html              # Backup version
│   ├── sign_language_model.keras       # Trained model
│   ├── label_encoder.pkl               # Label encoder
│   └── dataset/                        # Training/test data
├── BackEnd & FrontEnd/
│   ├── server.js                       # Main server file
│   ├── app.js                          # Express app (UPDATED)
│   ├── package.json                    # Dependencies (UPDATED with axios)
│   ├── routes/
│   │   └── predictions.js              # NEW: AI prediction route
│   └── ...
└── SETUP-INTEGRATED.md                 # This file
```

## Troubleshooting

### Backend can't connect to Flask
- Ensure Flask server is running on port 5000
- Check `AI_MODEL_URL` environment variable
- Verify firewall settings

### Frontend can't connect to Backend
- Ensure Node.js backend is running on port 8080
- Check browser console for CORS errors
- Verify `BACKEND_URL` in HTML files

### Model not loading
- Ensure `sign_language_model.keras` and `label_encoder.pkl` are in `AI Model/` directory
- Check Python dependencies are installed
- Verify TensorFlow version compatibility

## Notes

- Both servers (Flask and Node.js) must be running simultaneously
- The backend proxies all prediction requests to the Flask API
- CORS is enabled on both servers for development
- Production deployment may require additional security configurations

