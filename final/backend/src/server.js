require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const config = require('./config/config');
const BloodExpiryService = require('./services/bloodExpiry.service');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Blood Vault API is running' });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(config.PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🩸 BLOOD VAULT API SERVER RUNNING 🩸   ║
╠═══════════════════════════════════════════╣
║  Port: ${config.PORT}                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}            ║
║  MongoDB: Connected                       ║
║  ML Services: Active                      ║
║  Blood Expiry: Monitoring                 ║
╚═══════════════════════════════════════════╝
  `);
  
  // Initialize blood expiry monitoring
  BloodExpiryService.scheduleCleanup();
});

module.exports = app;