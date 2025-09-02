import os
import librosa
import numpy as np
from tqdm import tqdm

# --- Configuration Constants ---

# Path to the dataset.
DATASET_PATH = "gtzan_dataset"
# Path to save the processed data.
NPZ_FILE_PATH = "data/data.npz"

# Audio processing parameters.
SAMPLE_RATE = 22050  # All audio will be resampled to this rate.
DURATION = 30        # All audio will be trimmed or padded to this duration in seconds.
N_MELS = 128         # Number of Mel bands to generate.
HOP_LENGTH = 512     # Samples between successive frames.
N_FFT = 2048         # Length of the FFT window.

# --- Main Script ---

def prepare_dataset(dataset_path, npz_path, n_mels=N_MELS, hop_length=HOP_LENGTH, n_fft=N_FFT):
    """
    Processes audio files from the dataset, extracts Mel spectrograms,
    and saves them into a single compressed NumPy file.
    """
    # Create the data directory if it doesn't exist.
    if not os.path.exists(os.path.dirname(npz_path)):
        os.makedirs(os.path.dirname(npz_path))

    # This dictionary will store all our processed data.
    data = {
        "mappings": [],  # List of genre names, e.g., ["blues", "classical", ...]
        "labels": [],    # Integer labels corresponding to the genre for each track.
        "spectrograms": [] # The actual spectrogram data for each track.
    }

    num_samples_per_track = SAMPLE_RATE * DURATION

    print("Processing dataset...")

    # Use os.walk to recursively go through the dataset directory.
    for i, (dirpath, dirnames, filenames) in enumerate(tqdm(os.walk(dataset_path))):
        
        # The root directory doesn't contain genres, so we skip it.
        if dirpath is not dataset_path:
            
            # Get the genre name from the directory path.
            genre_name = os.path.basename(dirpath)
            data["mappings"].append(genre_name)
            print(f"\nProcessing genre: {genre_name}")

            # Process each audio file in the genre directory.
            for f in filenames:
                if f.endswith(".wav"):
                    file_path = os.path.join(dirpath, f)
                    
                    try:
                        # Load the audio file.
                        signal, sr = librosa.load(file_path, sr=SAMPLE_RATE)

                        # Ensure the track is at least the desired duration.
                        if len(signal) >= num_samples_per_track:
                            # Trim the signal to the exact duration.
                            signal = signal[:num_samples_per_track]

                            # Extract Mel spectrogram.
                            mel_spectrogram = librosa.feature.melspectrogram(
                                y=signal, sr=SAMPLE_RATE, n_mels=n_mels,
                                hop_length=hop_length, n_fft=n_fft
                            )
                            
                            # Convert to decibels (dB) for a more perceptually relevant representation.
                            log_mel_spectrogram = librosa.power_to_db(mel_spectrogram)

                            # Store the data.
                            data["spectrograms"].append(log_mel_spectrogram)
                            data["labels"].append(i - 1) # The label is the index of the genre.
                    
                    except Exception as e:
                        print(f"Error processing {file_path}: {e}")

    # Save the processed data to a compressed .npz file.
    # The **data syntax unpacks the dictionary into keyword arguments.
    print("\nSaving processed data to disk...")
    np.savez_compressed(npz_path, **data)
    print(f"Data successfully saved to {npz_path}")


if __name__ == "__main__":
    prepare_dataset(DATASET_PATH, NPZ_FILE_PATH)