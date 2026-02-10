require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Blood Vault Backend' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});