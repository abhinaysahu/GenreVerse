import os
import io
import random
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# Optional: If you want to actually run a Keras model, set MODEL_PATH env var
MODEL_PATH = os.environ.get("MODEL_PATH")

try:
    from tensorflow import keras
    import numpy as np
    import librosa
    MODEL_AVAILABLE = MODEL_PATH is not None
    MODEL = None
    if MODEL_AVAILABLE:
        try:
            MODEL = keras.models.load_model(MODEL_PATH)
            print("Loaded model from", MODEL_PATH)
        except Exception as e:
            print("Failed to load model:", e)
            MODEL = None
            MODEL_AVAILABLE = False
except Exception:
    # TensorFlow/librosa may not be installed in dev env
    MODEL_AVAILABLE = False

app = Flask(__name__)

# Simple health
@app.route('/health')
def health():
    return jsonify({"ok": True})

@app.route('/predict', methods=['POST'])
def predict():
    """
    Accepts form-data with file field named 'file'. Returns JSON:
    { genre: str, probabilities: {genre:prob}*, durationSec: float }
    If a real model is not available, returns a dummy random distribution.
    """
    if 'file' not in request.files:
        return jsonify({"error": "file missing"}), 400
    f = request.files['file']
    filename = secure_filename(f.filename)

    # Try to compute audio duration using librosa if available
    duration = None
    try:
        data_bytes = f.read()
        audio_buf = io.BytesIO(data_bytes)
        import soundfile as sf
        audio_buf.seek(0)
        data, sr = sf.read(audio_buf)
        duration = len(data) / float(sr)
    except Exception:
        duration = None

    # If model available, perform prediction on mel spectrogram
    if MODEL_AVAILABLE and MODEL is not None:
        try:
            audio_buf = io.BytesIO(f.read())
            audio_buf.seek(0)
            y, sr = librosa.load(audio_buf, sr=22050, mono=True)
            # Compute mel spectrogram and reshape for model - placeholder logic
            S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
            S_db = librosa.power_to_db(S, ref=np.max)
            img = np.expand_dims(S_db, axis=(0, -1))
            preds = MODEL.predict(img)[0]
            # Assume model classes are 10 genres - use generic labels
            labels = [f"genre_{i}" for i in range(len(preds))]
            probabilities = {labels[i]: float(preds[i]) for i in range(len(preds))}
            top = labels[int(np.argmax(preds))]
            return jsonify({"genre": top, "probabilities": probabilities, "durationSec": duration})
        except Exception as e:
            print("Model prediction failed:", e)

    # Fallback dummy prediction
    genres = ["rock", "pop", "jazz", "classical", "metal", "blues", "hiphop", "reggae", "country", "disco"]
    probs = [random.random() for _ in genres]
    s = sum(probs)
    probs = [p / s for p in probs]
    probabilities = {genres[i]: probs[i] for i in range(len(genres))}
    top = genres[int(max(range(len(probs)), key=lambda i: probs[i]))]
    return jsonify({"genre": top, "probabilities": probabilities, "durationSec": duration})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
