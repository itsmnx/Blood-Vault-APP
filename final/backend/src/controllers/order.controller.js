const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Recipient = require('../models/Recipient');
const MLService = require('../services/ml.service'); // ✅ Add this

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('recipientId')
      .populate('donorId')
      .populate('requestedBy')
      .populate('bloodUnits');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    
    // Check inventory availability
    const inv = await Inventory.findOne({
      bloodType: orderData.bloodType,
      component: orderData.component
    });
    
    if (!inv || inv.availableUnits < orderData.unitsRequested) {
      return res.status(400).json({ 
        error: `Insufficient inventory. Available: ${inv?.availableUnits || 0} units, Requested: ${orderData.unitsRequested} units` 
      });
    }
    
    const order = await Order.create(orderData);
    
    // Reserve units
    inv.availableUnits -= orderData.unitsRequested;
    inv.reservedUnits += orderData.unitsRequested;
    inv.lastUpdated = new Date();
    await inv.save();
    
    const populatedOrder = await Order.findById(order._id).populate('recipientId');
    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.fulfillOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'fulfilled') {
      return res.status(400).json({ error: 'Order already fulfilled' });
    }
    
    order.status = 'fulfilled';
    order.fulfilledAt = new Date();
    await order.save();
    
    // Update inventory
    const inv = await Inventory.findOne({
      bloodType: order.bloodType,
      component: order.component
    });
    
    if (inv) {
      inv.reservedUnits -= order.unitsRequested;
      inv.totalUnits -= order.unitsRequested;
      inv.lastUpdated = new Date();
      await inv.save();
    }
    
    // Update donor donation count and assign donor to order
    const Donor = require('../models/Donor');
    const compatibleDonor = await Donor.findOne({
      bloodType: order.bloodType,
      isEligible: true
    }).sort({ lastDonationDate: 1 }); // Get donor with oldest donation or never donated
    
    if (compatibleDonor) {
      compatibleDonor.totalDonations += order.unitsRequested;
      compatibleDonor.lastDonationDate = new Date();
      await compatibleDonor.save();
      
      // Assign donor to the order
      order.donorId = compatibleDonor._id;
      await order.save();
    }
    
    const populatedOrder = await Order.findById(order._id).populate('recipientId').populate('donorId');
    res.json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.autoFulfillOrders = async (req, res, next) => {
  try {
    const pendingOrders = await Order.find({ status: 'pending' }).populate('recipientId');
    
    if (pendingOrders.length === 0) {
      return res.json({ message: 'No pending orders', fulfilled: 0, skipped: 0 });
    }
    
    // Sort by priority
    const sortedOrders = pendingOrders.sort((a, b) => {
      const priorityA = a.recipientId?.predictedPriority || 0;
      const priorityB = b.recipientId?.predictedPriority || 0;
      return priorityB - priorityA;
    });
    
    let fulfilled = 0;
    let skipped = 0;
    
    for (const order of sortedOrders) {
      const inv = await Inventory.findOne({
        bloodType: order.bloodType,
        component: order.component
      });
      
      if (!inv || inv.reservedUnits < order.unitsRequested) {
        skipped++;
        continue;
      }
      
      order.status = 'fulfilled';
      order.fulfilledAt = new Date();
      await order.save();
      
      inv.reservedUnits -= order.unitsRequested;
      inv.totalUnits -= order.unitsRequested;
      inv.lastUpdated = new Date();
      await inv.save();
      
      // Update donor donation count and assign donor to order
      const Donor = require('../models/Donor');
      const compatibleDonor = await Donor.findOne({
        bloodType: order.bloodType,
        isEligible: true
      }).sort({ lastDonationDate: 1 }); // Get donor with oldest donation or never donated
      
      if (compatibleDonor) {
        compatibleDonor.totalDonations += order.unitsRequested;
        compatibleDonor.lastDonationDate = new Date();
        await compatibleDonor.save();
        
        // Assign donor to the order
        order.donorId = compatibleDonor._id;
        await order.save();
      }
      
      fulfilled++;
    }
    
    res.json({
      message: 'Auto-fulfill completed',
      fulfilled,
      skipped,
      total: pendingOrders.length
    });
  } catch (error) {
    next(error);
  }
};

// ML Controller
exports.getMLInsights = async (req, res, next) => {
  try {
    const recipients = await Recipient.find();
    const inventory = await Inventory.find();
    const orders = await Order.find();
    
    const criticalRecipients = recipients.filter(r => r.predictedPriority > 80).length;
    const stockAlerts = inventory.filter(i => i.availableUnits < i.minThreshold).length;
    
    const totalCapacity = inventory.reduce((sum, i) => sum + i.totalUnits, 0);
    const utilization = inventory.reduce((sum, i) => sum + (i.totalUnits - i.availableUnits), 0);
    const optimizationScore = totalCapacity > 0 ? Math.round((utilization / totalCapacity) * 100) : 0;
    
    const recommendations = MLService.generateInventoryRecommendations(inventory, orders, recipients);
    
    res.json({
      criticalRecipients,
      stockAlerts,
      optimizationScore,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

exports.getForecast = async (req, res, next) => {
  try {
    const orders = await Order.find().limit(100).sort({ createdAt: -1 });
    const inventory = await Inventory.find();
    
    const forecast = MLService.forecastDemand(orders, inventory);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
};

exports.matchDonors = async (req, res, next) => {
  try {
    const Donor = require('../models/Donor');
    const recipient = await Recipient.findById(req.params.recipientId);
    
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    const donors = await Donor.find();
    const matches = MLService.matchDonorsToRecipient(recipient, donors);
    
    res.json(matches);
  } catch (error) {
    next(error);
  }
};
