const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodType: { type: String, required: true },
  component: { type: String, required: true },
  totalUnits: { type: Number, default: 0 },
  availableUnits: { type: Number, default: 0 },
  reservedUnits: { type: Number, default: 0 },
  minThreshold: { 
    type: Number, 
    default: function() {
      // Set realistic thresholds based on component type
      switch(this.component) {
        case 'Platelets': return 3; // Shorter shelf life, lower threshold
        case 'Plasma': return 8;    // Longer shelf life, moderate threshold
        case 'RBC': return 5;       // Common component, moderate threshold
        case 'Whole Blood': return 4; // Less common, lower threshold
        default: return 5;
      }
    }
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);