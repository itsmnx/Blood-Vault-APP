const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  employeeId: { type: String, unique: true },
  department: String,
  position: String,
  phone: String,
  hireDate: Date,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Employee', employeeSchema);