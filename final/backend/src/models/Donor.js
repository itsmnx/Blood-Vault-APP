const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  bloodType: { type: String, required: true },
  dateOfBirth: Date,
  phone: String,
  address: String,
  lastDonationDate: Date,
  totalDonations: { type: Number, default: 0 },
  isEligible: { type: Boolean, default: true },
  medicalHistory: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', donorSchema);