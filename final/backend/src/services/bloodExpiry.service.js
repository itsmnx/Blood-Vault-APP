const Blood = require('../models/Blood');
const Inventory = require('../models/Inventory');

class BloodExpiryService {
  static async cleanupExpiredBlood() {
    try {
      console.log('🧹 Starting expired blood cleanup...');
      
      const today = new Date();
      const expiredUnits = await Blood.find({ expiryDate: { $lt: today } });
      
      if (expiredUnits.length === 0) {
        console.log('✅ No expired blood units found');
        return { deletedCount: 0, message: 'No expired units to clean up' };
      }
      
      // Update inventory counts before deletion
      const inventoryUpdates = {};
      
      for (const unit of expiredUnits) {
        const key = `${unit.bloodType}-${unit.component}`;
        if (!inventoryUpdates[key]) {
          inventoryUpdates[key] = { bloodType: unit.bloodType, component: unit.component, count: 0 };
        }
        inventoryUpdates[key].count += 1;
      }
      
      // Update inventory records
      for (const update of Object.values(inventoryUpdates)) {
        const inv = await Inventory.findOne({ 
          bloodType: update.bloodType, 
          component: update.component 
        });
        
        if (inv) {
          inv.totalUnits = Math.max(0, inv.totalUnits - update.count);
          inv.availableUnits = Math.max(0, inv.availableUnits - update.count);
          inv.lastUpdated = new Date();
          await inv.save();
          
          console.log(`📦 Updated inventory: ${update.bloodType} ${update.component} -${update.count} units`);
        }
      }
      
      // Delete expired blood units
      const result = await Blood.deleteMany({ expiryDate: { $lt: today } });
      
      console.log(`🗑️ Cleaned up ${result.deletedCount} expired blood units`);
      
      return {
        deletedCount: result.deletedCount,
        message: `Successfully cleaned up ${result.deletedCount} expired blood units`,
        expiredUnits: expiredUnits.map(unit => ({
          bagNumber: unit.bagNumber,
          bloodType: unit.bloodType,
          component: unit.component,
          expiryDate: unit.expiryDate
        }))
      };
    } catch (error) {
      console.error('❌ Error during expired blood cleanup:', error);
      throw error;
    }
  }
  
  static async getExpiryReport() {
    try {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const [expired, critical, expiring, total] = await Promise.all([
        Blood.countDocuments({ expiryDate: { $lt: today } }),
        Blood.countDocuments({ expiryDate: { $gte: today, $lt: threeDaysFromNow } }),
        Blood.countDocuments({ expiryDate: { $gte: threeDaysFromNow, $lt: sevenDaysFromNow } }),
        Blood.countDocuments()
      ]);
      
      return {
        total,
        expired,
        critical,
        expiring,
        fresh: total - expired - critical - expiring,
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('❌ Error generating expiry report:', error);
      throw error;
    }
  }
  
  static async scheduleCleanup() {
    // Run cleanup every day at midnight
    setInterval(async () => {
      try {
        const now = new Date();
        // Check if it's midnight (00:00)
        if (now.getHours() === 0 && now.getMinutes() === 0) {
          await this.cleanupExpiredBlood();
        }
      } catch (error) {
        console.error('❌ Scheduled cleanup failed:', error);
      }
    }, 60000); // Check every minute
    
    console.log('⏰ Scheduled daily expired blood cleanup at midnight');
  }
  
  static async getExpiringUnits(days = 7) {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      const expiringUnits = await Blood.find({
        expiryDate: { $gte: today, $lte: futureDate }
      })
      .populate('donorId')
      .sort({ expiryDate: 1 });
      
      return expiringUnits.map(unit => {
        const daysUntilExpiry = Math.ceil((new Date(unit.expiryDate) - today) / (1000 * 60 * 60 * 24));
        return {
          ...unit.toObject(),
          daysUntilExpiry
        };
      });
    } catch (error) {
      console.error('❌ Error fetching expiring units:', error);
      throw error;
    }
  }
}

module.exports = BloodExpiryService;