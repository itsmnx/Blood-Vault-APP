const Inventory = require('../models/Inventory');
const constants = require('../config/constants');

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find();
    
    // Enhance inventory data with calculated fields
    const enhancedInventory = inventory.map(item => {
      const itemObj = item.toObject();
      
      // Calculate status based on available units vs threshold
      let status = 'In Stock';
      let statusColor = 'green';
      
      if (itemObj.availableUnits === 0) {
        status = 'Out of Stock';
        statusColor = 'red';
      } else if (itemObj.availableUnits <= itemObj.minThreshold * 0.5) {
        status = 'Critical Low';
        statusColor = 'red';
      } else if (itemObj.availableUnits <= itemObj.minThreshold) {
        status = 'Low Stock';
        statusColor = 'orange';
      } else if (itemObj.availableUnits <= itemObj.minThreshold * 1.5) {
        status = 'Moderate';
        statusColor = 'yellow';
      } else {
        status = 'Well Stocked';
        statusColor = 'green';
      }
      
      return {
        ...itemObj,
        status,
        statusColor,
        utilizationRate: itemObj.totalUnits > 0 ? 
          ((itemObj.totalUnits - itemObj.availableUnits) / itemObj.totalUnits * 100).toFixed(1) : 0
      };
    });
    
    res.json(enhancedInventory);
  } catch (error) {
    next(error);
  }
};

exports.initializeInventory = async (req, res, next) => {
  try {
    console.log('🔧 Starting inventory initialization...');
    const bloodTypes = constants.BLOOD_TYPES;
    const components = constants.BLOOD_COMPONENTS;
    console.log('📋 Blood Types:', bloodTypes);
    console.log('🧪 Components:', components);
    
    // Create inventory entries for all combinations if they don't exist
    for (const bloodType of bloodTypes) {
      for (const component of components) {
        const existing = await Inventory.findOne({ bloodType, component });
        
        if (!existing) {
          // Create with some sample data for demonstration
          const minThreshold = {
            'Platelets': 3,
            'Plasma': 8,
            'RBC': 5,
            'Whole Blood': 4
          }[component] || 5;
          
          const sampleUnits = Math.floor(Math.random() * 15) + minThreshold;
          const availableUnits = Math.floor(sampleUnits * 0.8);
          const reservedUnits = sampleUnits - availableUnits;
          
          console.log(`➕ Creating inventory: ${bloodType} ${component} - ${sampleUnits} units`);
          
          await Inventory.create({
            bloodType,
            component,
            totalUnits: sampleUnits,
            availableUnits: availableUnits,
            reservedUnits: reservedUnits,
            minThreshold
          });
        } else {
          console.log(`⏭️ Skipping existing: ${bloodType} ${component}`);
        }
      }
    }
    
    console.log('✅ Inventory initialization completed successfully');
    res.json({ 
      message: 'Inventory initialized successfully',
      bloodTypes: bloodTypes.length,
      components: components.length,
      totalCombinations: bloodTypes.length * components.length
    });
  } catch (error) {
    console.error('❌ Error initializing inventory:', error);
    next(error);
  }
};
