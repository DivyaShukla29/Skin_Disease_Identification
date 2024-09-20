from flask import Flask, request, jsonify
from keras.models import load_model
from keras.preprocessing.image import img_to_array
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# Load the trained model
model = load_model("C:/Users/fci/Downloads/skin_disease_model_AutoKeras.keras")

# Define the class labels for prediction
class_labels = ['Melanocytic nevi', 'Melanoma', 'Benign keratosis-like lesions',
                'Basal cell carcinoma', 'Actinic keratoses', 'Vascular lesions', 'Dermatofibroma']

def prepare_image(image, target_size):
    # Ensure image is in RGB mode and resized to match the model's input size
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0  # Normalize pixel values
    return image

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Read the image from the request
    file = request.files['file']
    img = Image.open(io.BytesIO(file.read()))

    # Prepare the image for prediction
    prepared_image = prepare_image(img, target_size=(32, 32))

    # Make a prediction
    predictions = model.predict(prepared_image)
    predicted_class = np.argmax(predictions)
    label = class_labels[predicted_class]

    # Return the result
    return jsonify({'prediction': label})

if __name__ == '__main__':
    app.run(debug=True)
