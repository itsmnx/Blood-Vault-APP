const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipient' },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }, // Track which donor provided blood
  bloodType: { type: String, required: true },
  component: String,
  unitsRequested: Number,
  urgency: String,
  status: { type: String, default: 'pending' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  bloodUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blood' }],
  createdAt: { type: Date, default: Date.now },
  fulfilledAt: Date
});

module.exports = mongoose.model('Order', orderSchema);