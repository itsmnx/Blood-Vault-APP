const Blood = require('../models/Blood');
const Inventory = require('../models/Inventory');
const constants = require('../config/constants');

exports.createBloodUnit = async (req, res, next) => {
  try {
    const bloodData = req.body;
    
    // Auto-generate bag number if not provided
    if (!bloodData.bagNumber) {
      const count = await Blood.countDocuments();
      bloodData.bagNumber = `BG${Date.now()}-${count + 1}`;
    }
    
    // Set expiry date based on collection date and component type
    if (bloodData.collectionDate) {
      const collectionDate = new Date(bloodData.collectionDate);
      const expiryDays = constants.EXPIRY_DAYS[bloodData.component] || 35;
      bloodData.expiryDate = new Date(collectionDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    } else {
      // Fallback to current date if no collection date provided
      const expiryDays = constants.EXPIRY_DAYS[bloodData.component] || 35;
      bloodData.expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    }
    
    const blood = await Blood.create(bloodData);
    
    // Update inventory
    let inv = await Inventory.findOne({ 
      bloodType: blood.bloodType, 
      component: blood.component 
    });
    
    if (inv) {
      inv.totalUnits += 1;
      inv.availableUnits += 1;
      inv.lastUpdated = new Date();
      await inv.save();
    } else {
      await Inventory.create({
        bloodType: blood.bloodType,
        component: blood.component,
        totalUnits: 1,
        availableUnits: 1
      });
    }
    
    res.status(201).json(blood);
  } catch (error) {
    next(error);
  }
};

exports.getAllBloodUnits = async (req, res, next) => {
  try {
    const { includeExpired = 'false' } = req.query;
    
    let query = {};
    if (includeExpired === 'false') {
      query.expiryDate = { $gt: new Date() };
    }
    
    const bloodUnits = await Blood.find(query)
      .populate('donorId')
      .sort({ expiryDate: 1, collectionDate: -1 });
    
    // Add expiry status to each unit
    const unitsWithStatus = bloodUnits.map(unit => {
      const today = new Date();
      const expiryDate = new Date(unit.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      let status;
      if (daysUntilExpiry < 0) status = 'expired';
      else if (daysUntilExpiry <= 3) status = 'critical';
      else if (daysUntilExpiry <= 7) status = 'expiring';
      else if (daysUntilExpiry <= 14) status = 'warning';
      else status = 'fresh';
      
      return {
        ...unit.toObject(),
        daysUntilExpiry,
        expiryStatus: status
      };
    });
    
    res.json(unitsWithStatus);
  } catch (error) {
    next(error);
  }
};

exports.deleteExpiredBlood = async (req, res, next) => {
  try {
    const today = new Date();
    const expiredUnits = await Blood.find({ expiryDate: { $lt: today } });
    
    // Update inventory counts before deletion
    for (const unit of expiredUnits) {
      const inv = await Inventory.findOne({ 
        bloodType: unit.bloodType, 
        component: unit.component 
      });
      
      if (inv) {
        inv.totalUnits = Math.max(0, inv.totalUnits - 1);
        inv.availableUnits = Math.max(0, inv.availableUnits - 1);
        inv.lastUpdated = new Date();
        await inv.save();
      }
    }
    
    const result = await Blood.deleteMany({ expiryDate: { $lt: today } });
    
    res.json({
      message: `Successfully removed ${result.deletedCount} expired blood unit(s)`,
      deletedCount: result.deletedCount,
      expiredUnits: expiredUnits.map(unit => ({
        bagNumber: unit.bagNumber,
        bloodType: unit.bloodType,
        component: unit.component,
        expiryDate: unit.expiryDate
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBloodUnit = async (req, res, next) => {
  try {
    const bloodUnit = await Blood.findById(req.params.id);
    
    if (!bloodUnit) {
      return res.status(404).json({ error: 'Blood unit not found' });
    }
    
    // Update inventory
    const inv = await Inventory.findOne({ 
      bloodType: bloodUnit.bloodType, 
      component: bloodUnit.component 
    });
    
    if (inv) {
      inv.totalUnits = Math.max(0, inv.totalUnits - 1);
      inv.availableUnits = Math.max(0, inv.availableUnits - 1);
      inv.lastUpdated = new Date();
      await inv.save();
    }
    
    await Blood.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Blood unit deleted successfully',
      deletedUnit: {
        bagNumber: bloodUnit.bagNumber,
        bloodType: bloodUnit.bloodType,
        component: bloodUnit.component
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpiryReport = async (req, res, next) => {
  try {
    const BloodExpiryService = require('../services/bloodExpiry.service');
    const report = await BloodExpiryService.getExpiryReport();
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getExpiringUnits = async (req, res, next) => {
  try {
    const BloodExpiryService = require('../services/bloodExpiry.service');
    const { days = 7 } = req.query;
    const expiringUnits = await BloodExpiryService.getExpiringUnits(parseInt(days));
    res.json(expiringUnits);
  } catch (error) {
    next(error);
  }
};

exports.getExpiryReport = async (req, res, next) => {
  try {
    const BloodExpiryService = require('../services/bloodExpiry.service');
    const report = await BloodExpiryService.getExpiryReport();
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getExpiringUnits = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const BloodExpiryService = require('../services/bloodExpiry.service');
    const expiringUnits = await BloodExpiryService.getExpiringUnits(parseInt(days));
    res.json(expiringUnits);
  } catch (error) {
    next(error);
  }
};

exports.initializeSampleBloodUnits = async (req, res, next) => {
  try {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const components = ['Whole Blood', 'Plasma', 'Platelets', 'Red Blood Cells'];
    const volumes = [350, 400, 450, 500];
    
    const sampleUnits = [];
    let counter = 1;
    
    for (let i = 0; i < 25; i++) {
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const component = components[Math.floor(Math.random() * components.length)];
      const volume = volumes[Math.floor(Math.random() * volumes.length)];
      
      // Create collection dates ranging from 50 days ago to today
      const daysAgo = Math.floor(Math.random() * 50);
      const collectionDate = new Date();
      collectionDate.setDate(collectionDate.getDate() - daysAgo);
      
      // Calculate expiry based on component
      const expiryDays = constants.EXPIRY_DAYS[component] || 35;
      const expiryDate = new Date(collectionDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);
      
      const unit = {
        bagNumber: `BG${Date.now()}-${counter++}`,
        bloodType,
        component,
        volume,
        collectionDate,
        expiryDate,
        donorId: null // Anonymous donation for sample data
      };
      
      sampleUnits.push(unit);
    }
    
    // Create all sample units
    const createdUnits = await Blood.insertMany(sampleUnits);
    
    // Update inventory counts
    const inventoryUpdates = {};
    
    for (const unit of createdUnits) {
      const key = `${unit.bloodType}-${unit.component}`;
      if (!inventoryUpdates[key]) {
        inventoryUpdates[key] = {
          bloodType: unit.bloodType,
          component: unit.component,
          count: 0
        };
      }
      inventoryUpdates[key].count++;
    }
    
    // Apply inventory updates
    for (const update of Object.values(inventoryUpdates)) {
      let inv = await Inventory.findOne({ 
        bloodType: update.bloodType, 
        component: update.component 
      });
      
      if (inv) {
        inv.totalUnits += update.count;
        inv.availableUnits += update.count;
        inv.lastUpdated = new Date();
        await inv.save();
      } else {
        await Inventory.create({
          bloodType: update.bloodType,
          component: update.component,
          totalUnits: update.count,
          availableUnits: update.count
        });
      }
    }
    
    res.json({
      message: `Successfully created ${createdUnits.length} sample blood units`,
      createdCount: createdUnits.length,
      bloodTypes: [...new Set(createdUnits.map(u => u.bloodType))],
      components: [...new Set(createdUnits.map(u => u.component))],
      inventoryUpdates: Object.keys(inventoryUpdates).length
    });
  } catch (error) {
    next(error);
  }
};