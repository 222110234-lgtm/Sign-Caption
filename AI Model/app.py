from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import joblib
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Initialize the Flask application
app = Flask(__name__)
CORS(app) # This allows the frontend to communicate with the backend

# --- Load the saved model and encoder ---
print("Loading model and encoder...")
model = tf.keras.models.load_model('sign_language_model.keras')
label_encoder = joblib.load('label_encoder.pkl')
print("Model and encoder loaded successfully!")

# Define the prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    # Get the landmark data from the request
    data = request.get_json()
    sequence_data = data.get('landmarks', [])
    
    if not sequence_data:
        return jsonify({'error': 'No landmark data provided'}), 400

    # --- Preprocess the data just like we did for training ---
    # Convert to numpy array
    sequence_np = np.array(sequence_data)
    
    # Reshape to (1, num_frames, num_features)
    sequence_reshaped = sequence_np.reshape(1, sequence_np.shape[0], sequence_np.shape[1])
    
    # Pad the sequence
    # We need to know the max length from training. Let's assume it's the model's input shape.
    # Note: It's better to save this value during training, but this is a good approximation.
    max_len = model.input_shape[1]
    sequence_padded = pad_sequences(sequence_reshaped, maxlen=max_len, padding='post', dtype='float32')

    # --- Make a prediction ---
    prediction = model.predict(sequence_padded)
    
    # --- Convert prediction to a word ---
    predicted_class_index = np.argmax(prediction, axis=1)[0]
    predicted_label = label_encoder.inverse_transform([predicted_class_index])[0]

    print(f"Prediction: {predicted_label}")

    # Return the result as JSON
    return jsonify({'prediction': predicted_label})

# Run the app
if __name__ == '__main__':
    
    app.run(host='0.0.0.0', port=5000)