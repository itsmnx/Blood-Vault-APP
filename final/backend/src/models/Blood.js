const mongoose = require('mongoose');

const bloodSchema = new mongoose.Schema({
  bloodType: { type: String, required: true },
  component: { type: String, required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  collectionDate: { type: Date, default: Date.now },
  expiryDate: Date,
  status: { type: String, default: 'available' },
  bagNumber: { type: String, unique: true },
  volume: Number,
  testResults: {
    hiv: Boolean,
    hepatitisB: Boolean,
    hepatitisC: Boolean,
    syphilis: Boolean
  }
});

module.exports = mongoose.model('Blood', bloodSchema);