import os
import numpy as np
import librosa
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

# --- Configuration Constants (matching your script) ---
SAMPLE_RATE = 22050
DURATION = 30
N_MELS = 128
HOP_LENGTH = 512
N_FFT = 2048
NUM_SAMPLES_PER_TRACK = SAMPLE_RATE * DURATION

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app) 
MODEL_PATH = 'model/genre_classifier.h5'
GENRES = ['blues', 'classical', 'country', 'disco', 'hiphop', 'jazz', 'metal', 'pop', 'reggae', 'rock']

def preprocess_audio(file_path, n_mels=N_MELS, hop_length=HOP_LENGTH, n_fft=N_FFT):
    signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)

    if len(signal) > NUM_SAMPLES_PER_TRACK:
        signal = signal[:NUM_SAMPLES_PER_TRACK]

    mel_spectrogram = librosa.feature.melspectrogram(
        y=signal, sr=SAMPLE_RATE, n_mels=n_mels,
        hop_length=hop_length, n_fft=n_fft
    )

    log_mel_spectrogram = librosa.power_to_db(mel_spectrogram)

    log_mel_spectrogram = log_mel_spectrogram[np.newaxis, ..., np.newaxis]

    return log_mel_spectrogram

@app.route('/classify-audio', methods=['POST'])
def classify_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    temp_path = f'/tmp/{file.filename}'
    file.save(temp_path)

    try:
        model = load_model(MODEL_PATH)
        input_data = preprocess_audio(temp_path)
        prediction = model.predict(input_data)

        predicted_genre_index = np.argmax(prediction)
        predicted_genre = GENRES[predicted_genre_index]
        confidence = float(np.max(prediction))

        scores = {genre: float(score) for genre, score in zip(GENRES, prediction[0])}

        response = {
            'genre': predicted_genre,
            'confidence': confidence,
            'probabilities': scores,
            'message': 'Classification successful'
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(port=5000, debug=True)