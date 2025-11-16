import { Router } from 'express';
import axios from 'axios';

const router = Router();

// AI Model Flask API URL - can be configured via environment variable
const AI_MODEL_URL = process.env.AI_MODEL_URL || 'http://localhost:5000';

/**
 * POST /api/predictions/predict
 * Proxies prediction requests to the Flask AI model
 * 
 * Request body:
 * {
 *   "landmarks": [[...], [...], ...] // Array of landmark sequences
 * }
 * 
 * Response:
 * {
 *   "ok": true,
 *   "prediction": "word"
 * }
 */
router.post('/predict', async (req, res) => {
  try {
    const { landmarks } = req.body;

    if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid request: landmarks array is required'
      });
    }

    // Forward the request to the Flask AI model
    const response = await axios.post(`${AI_MODEL_URL}/predict`, {
      landmarks
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Return the prediction result
    return res.json({
      ok: true,
      prediction: response.data.prediction
    });

  } catch (error) {
    console.error('AI Model prediction error:', error.message);

    // Handle different types of errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        ok: false,
        error: 'AI Model service is unavailable. Please ensure the Flask server is running on port 5000.'
      });
    }

    if (error.response) {
      // Flask API returned an error
      return res.status(error.response.status).json({
        ok: false,
        error: error.response.data?.error || 'AI Model prediction failed'
      });
    }

    return res.status(500).json({
      ok: false,
      error: 'Internal server error during prediction'
    });
  }
});

/**
 * GET /api/predictions/health
 * Check if the AI model service is available
 */
router.get('/health', async (_req, res) => {
  try {
    // Try to ping the Flask server (you might want to add a health endpoint to Flask)
    const response = await axios.get(`${AI_MODEL_URL}/predict`, {
      timeout: 2000,
      validateStatus: () => true // Don't throw on any status
    });

    return res.json({
      ok: true,
      aiModelAvailable: response.status !== 503,
      aiModelUrl: AI_MODEL_URL
    });
  } catch (error) {
    return res.json({
      ok: true,
      aiModelAvailable: false,
      aiModelUrl: AI_MODEL_URL,
      error: 'AI Model service is not reachable'
    });
  }
});

export default router;

