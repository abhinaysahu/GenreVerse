GenreVerse ML microservice

This folder contains a lightweight Flask microservice that accepts audio files and returns genre predictions.

Usage

1. Install dependencies:

   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

2. Optionally set MODEL_PATH environment variable to a saved Keras model.

3. Run:

   python app.py

The service listens on port 5001 by default and exposes /predict (POST) and /health endpoints.
