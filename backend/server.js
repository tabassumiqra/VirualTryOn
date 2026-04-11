const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/upload');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Expose the uploads and results directories to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/results', express.static(path.join(__dirname, 'results')));

// Routes
app.use('/api', uploadRoutes);

const PORT = process.env.PORT || 5000;

// Since we may not have a real MongoDB URI yet, we can wrap this in a try-catch and still start the server if it fails
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/virtual-tryon', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error, proceeding without DB:', err.message);
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
