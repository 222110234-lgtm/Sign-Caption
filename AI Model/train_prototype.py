import json
import numpy as np
import os
import random
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Masking, Dropout, BatchNormalization # <-- Import BatchNormalization
from tensorflow.keras.preprocessing.sequence import pad_sequences
import joblib

# --- Set Global Random Seeds for Reproducibility ---
os.environ['PYTHONHASHSEED'] = '0'
np.random.seed(42)
random.seed(42)
tf.random.set_seed(42)

# --- Data Augmentation Function (Unchanged) ---
def augment_data(sequences, labels, num_augmented_sets=2):
    augmented_sequences = list(sequences)
    augmented_labels = list(labels)
    for _ in range(num_augmented_sets):
        for seq, label in zip(sequences, labels):
            noise = np.random.normal(0, 0.005, seq.shape)
            augmented_sequences.append(seq + noise)
            augmented_labels.append(label)
            scale_factor = np.random.uniform(0.9, 1.1)
            augmented_sequences.append(seq * scale_factor)
            augmented_labels.append(label)
    return np.array(augmented_sequences, dtype=object), np.array(augmented_labels)

# --- Load Data from Specific Directories (Unchanged) ---
def load_data_from_directory(directory):
    all_labels = []
    all_sequences = []
    if not os.path.exists(directory):
        print(f"Error: Directory not found at {directory}")
        return [], []
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            filepath = os.path.join(directory, filename)
            print(f"Loading data from {filename}...")
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for item in data:
                all_labels.append(item['label'])
                frames = []
                for frame in item['data']:
                    landmark_list = frame[0] 
                    frame_landmarks = np.array([[lm['x'], lm['y'], lm['z']] for lm in landmark_list]).flatten()
                    frames.append(frame_landmarks)
                all_sequences.append(np.array(frames))
    return all_sequences, all_labels

# Load the training data
train_sequences, train_labels = load_data_from_directory('dataset/train')

# --- NEW: Increase Augmentation ---
print("\nAugmenting training data...")
# Let's create even more data this time
train_sequences, train_labels = augment_data(train_sequences, train_labels, num_augmented_sets=4)

# Load the testing data
test_sequences, test_labels = load_data_from_directory('dataset/test')

print(f"\nLoaded {len(train_sequences)} augmented training sequences.")
print(f"Loaded {len(test_sequences)} testing sequences.")

# --- Preprocessing (Unchanged) ---
X_train_padded = pad_sequences(train_sequences, padding='post', dtype='float32')
X_test_padded = pad_sequences(test_sequences, padding='post', dtype='float32', maxlen=X_train_padded.shape[1])

label_encoder = LabelEncoder()
y_train_int = label_encoder.fit_transform(train_labels)
y_test_int = label_encoder.transform(test_labels)

onehot_encoder = OneHotEncoder(sparse_output=False)
y_train_int = y_train_int.reshape(len(y_train_int), 1)
y_test_int = y_test_int.reshape(len(y_test_int), 1)

y_train = onehot_encoder.fit_transform(y_train_int)
y_test = onehot_encoder.transform(y_test_int)

print(f"Shape of training data: {X_train_padded.shape}")
print(f"Shape of testing data: {X_test_padded.shape}")

# --- NEW: A Smarter, Deeper Model ---
model = Sequential([
    Masking(mask_value=0.0, input_shape=(X_train_padded.shape[1], X_train_padded.shape[2])),
    
    LSTM(64, return_sequences=True, activation='relu'),
    BatchNormalization(), # Helps stabilize the network
    Dropout(0.3), # Fights overfitting
    
    LSTM(128, activation='relu'), # The second layer
    BatchNormalization(),
    Dropout(0.3),
    
    Dense(64, activation='relu'),
    
    Dense(y_train.shape[1], activation='softmax')
])
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()


# --- Train the Model (Increased Epochs) ---
print("\n--- Starting Model Training ---")
# This will take longer, but the model needs more time to learn
history = model.fit(X_train_padded, y_train, epochs=75, batch_size=32, validation_split=0.2)
print("\n--- Model Training Finished ---")


# --- Evaluate the Model ---
loss, accuracy = model.evaluate(X_test_padded, y_test)
print(f"\nTest Accuracy on separate test set: {accuracy * 100:.2f}%")

# --- Save the Model and Encoder ---
print("\n--- Saving model and label encoder ---")
model.save('sign_language_model.keras')
joblib.dump(label_encoder, 'label_encoder.pkl')
print("Model and encoder saved successfully!")