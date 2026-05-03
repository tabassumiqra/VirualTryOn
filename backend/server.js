const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

const uploadRoutes = require('./routes/upload');
const recommendRoutes = require('./routes/recommend');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Expose the uploads and results directories to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/results', express.static(path.join(__dirname, 'results')));

// Routes
app.use('/api', uploadRoutes);
app.use('/api', recommendRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
