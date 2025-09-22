import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from sklearn.model_selection import train_test_split

# --- Configuration Constants (matching your preprocessing script) ---
DATA_PATH = "data/data.npz"
MODEL_SAVE_PATH = "model/genre_classifier.h5"

# --- Main Script ---
def load_data(data_path):
    data = np.load(data_path, allow_pickle=True)
    spectrograms = data['spectrograms']
    labels = data['labels']

    # Reshape the data for CNN input
    spectrograms = spectrograms[..., np.newaxis]

    mappings = data['mappings'].tolist()

    return spectrograms, labels, mappings

def build_cnn_model(input_shape):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D((3, 3), strides=(2, 2), padding='same'))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((3, 3), strides=(2, 2), padding='same'))
    model.add(Dropout(0.3))
    model.add(Flatten())
    model.add(Dense(64, activation='relu'))
    model.add(Dense(10, activation='softmax'))
    return model

if __name__ == "__main__":
    inputs, labels, genres = load_data(DATA_PATH)
    X_train, X_test, y_train, y_test = train_test_split(
        inputs, labels, test_size=0.2, random_state=42, stratify=labels
    )

    input_shape = (X_train.shape[1], X_train.shape[2], 1)
    model = build_cnn_model(input_shape)

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    print("Starting model training...")
    model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))

    model.save(MODEL_SAVE_PATH)
    print(f"Model successfully trained and saved to {MODEL_SAVE_PATH}")