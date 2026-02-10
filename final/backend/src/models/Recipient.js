const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  bloodType: { type: String, required: true },
  phone: String,
  hospital: String,
  urgencyLevel: { type: Number, min: 1, max: 10 },
  condition: String,
  requiredUnits: Number,
  hemoglobinLevel: Number,
  systolicBP: Number,
  diastolicBP: Number,
  heartRate: Number,
  age: Number,
  admissionDate: Date,
  predictedPriority: Number,
  riskScore: Number,
  survivalProbability: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipient', recipientSchema);