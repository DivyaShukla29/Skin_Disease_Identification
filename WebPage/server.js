const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS)
app.use(express.static('public'));

// Multer setup for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve the HTML page at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/input.html'));
});

// Handle image uploads and forward to Flask
app.post('/predict', upload.single('file'), async (req, res) => {
  try {
    // Prepare the image to send to Flask
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    // Make request to Flask server
    const flaskResponse = await axios.post('http://127.0.0.1:5000/predict', formData, {
      headers: formData.getHeaders(),
    });

    // Send the prediction back to the frontend
    res.send(`
      <html>
      <head><title>Prediction Result</title></head>
      <body>
        <h1>Prediction: ${flaskResponse.data.prediction}</h1>
        <a href="/">Go Back</a>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error communicating with Flask server:', error);
    res.status(500).send(`
      <html>
      <head><title>Error</title></head>
      <body>
        <h1>Error processing image</h1>
        <a href="/">Go Back</a>
      </body>
      </html>
    `);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
