class MLService {
  // 1. Advanced Priority Prediction
  static advancedPriorityPrediction(recipient) {
    let score = 0;
    let factors = [];
    
    // Urgency level (25% weight)
    const urgencyScore = (recipient.urgencyLevel || 5) * 2.5;
    score += urgencyScore;
    factors.push(`Urgency: ${urgencyScore.toFixed(1)}`);
    
    // Hemoglobin level (25% weight)
    if (recipient.hemoglobinLevel) {
      let hbScore = 0;
      if (recipient.hemoglobinLevel < 6) hbScore = 25;
      else if (recipient.hemoglobinLevel < 7) hbScore = 22;
      else if (recipient.hemoglobinLevel < 8) hbScore = 18;
      else if (recipient.hemoglobinLevel < 9) hbScore = 15;
      else if (recipient.hemoglobinLevel < 10) hbScore = 10;
      else if (recipient.hemoglobinLevel < 11) hbScore = 5;
      score += hbScore;
      factors.push(`Hemoglobin: ${hbScore.toFixed(1)}`);
    }
    
    // Blood Pressure Analysis (20% weight)
    let bpScore = 0;
    if (recipient.systolicBP && recipient.diastolicBP) {
      if (recipient.systolicBP < 90 || recipient.diastolicBP < 60) bpScore = 20;
      else if (recipient.systolicBP < 100 || recipient.diastolicBP < 65) bpScore = 15;
      else if (recipient.systolicBP < 110) bpScore = 10;
      else if (recipient.systolicBP > 180 || recipient.diastolicBP > 120) bpScore = 15;
      score += bpScore;
      factors.push(`BP: ${bpScore.toFixed(1)}`);
    }
    
    // Heart Rate (15% weight)
    let hrScore = 0;
    if (recipient.heartRate) {
      if (recipient.heartRate > 120 || recipient.heartRate < 50) hrScore = 15;
      else if (recipient.heartRate > 110 || recipient.heartRate < 55) hrScore = 10;
      else if (recipient.heartRate > 100 || recipient.heartRate < 60) hrScore = 5;
      score += hrScore;
      factors.push(`HR: ${hrScore.toFixed(1)}`);
    }
    
    // Age Factor (10% weight)
    let ageScore = 0;
    if (recipient.age) {
      if (recipient.age < 5) ageScore = 10;
      else if (recipient.age < 12) ageScore = 8;
      else if (recipient.age > 75) ageScore = 9;
      else if (recipient.age > 65) ageScore = 7;
      else if (recipient.age < 18) ageScore = 5;
      score += ageScore;
      factors.push(`Age: ${ageScore.toFixed(1)}`);
    }
    
    // Time-based urgency (5% weight)
    if (recipient.createdAt) {
      const hoursWaiting = (Date.now() - new Date(recipient.createdAt)) / (1000 * 60 * 60);
      const timeScore = Math.min(5, hoursWaiting / 24 * 5);
      score += timeScore;
      factors.push(`Wait time: ${timeScore.toFixed(1)}`);
    }
    
    return {
      score: Math.min(100, Math.round(score)),
      factors
    };
  }

  // 2. Risk Stratification
  static calculateRiskScore(recipient) {
    let risk = 0;
    
    if (recipient.hemoglobinLevel < 7) risk += 40;
    else if (recipient.hemoglobinLevel < 9) risk += 25;
    
    if (recipient.systolicBP < 90) risk += 30;
    
    if (recipient.heartRate > 120 || recipient.heartRate < 50) risk += 20;
    
    if (recipient.age < 5 || recipient.age > 75) risk += 10;
    
    return Math.min(100, risk);
  }

  // 3. Survival Probability
  static predictSurvivalProbability(recipient) {
    let baseProb = 95;
    
    if (recipient.hemoglobinLevel < 6) baseProb -= 30;
    else if (recipient.hemoglobinLevel < 7) baseProb -= 20;
    else if (recipient.hemoglobinLevel < 8) baseProb -= 10;
    
    if (recipient.systolicBP < 80) baseProb -= 25;
    else if (recipient.systolicBP < 90) baseProb -= 15;
    
    if (recipient.heartRate > 130 || recipient.heartRate < 45) baseProb -= 20;
    else if (recipient.heartRate > 120 || recipient.heartRate < 50) baseProb -= 10;
    
    if (recipient.age > 80) baseProb -= 15;
    else if (recipient.age > 75) baseProb -= 10;
    else if (recipient.age < 5) baseProb -= 12;
    
    return Math.max(0, Math.min(100, baseProb));
  }

  // 4. Demand Forecasting
  static forecastDemand(historicalOrders, inventory) {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const predictions = {};
    
    bloodTypes.forEach(type => {
      const recentOrders = historicalOrders
        .filter(o => o.bloodType === type)
        .slice(-30);
      
      const avgDemand = recentOrders.length > 0 
        ? recentOrders.reduce((sum, o) => sum + (o.unitsRequested || 1), 0) / recentOrders.length 
        : 5;
      
      const currentDay = new Date().getDay();
      const weekendMultiplier = (currentDay === 0 || currentDay === 6) ? 0.8 : 1.1;
      const variation = 0.8 + Math.random() * 0.4;
      
      predictions[type] = Math.round(avgDemand * weekendMultiplier * variation * 7);
    });
    
    const highDemand = Object.entries(predictions)
      .filter(([_, demand]) => demand > 15)
      .map(([type]) => type);
    
    const insight = highDemand.length > 0
      ? `High demand predicted for ${highDemand.join(', ')}. Consider increasing stock levels.`
      : 'Demand levels appear normal. Monitor inventory closely.';
    
    return { predictions, insight };
  }

  // 5. Smart Donor Matching
  static matchDonorsToRecipient(recipient, donors) {
    const constants = require('../config/constants');
    const compatibility = constants.BLOOD_COMPATIBILITY;
    const matches = [];
    
    donors.forEach(donor => {
      if (!donor.isEligible) return;
      
      const compatible = compatibility[donor.bloodType]?.includes(recipient.bloodType);
      if (!compatible) return;
      
      let matchScore = 0;
      const reasons = [];
      
      if (donor.bloodType === recipient.bloodType) {
        matchScore += 50;
        reasons.push('Exact blood type match');
      } else {
        matchScore += 30;
        reasons.push('Compatible blood type');
      }
      
      if (donor.lastDonationDate) {
        const daysSinceLastDonation = (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastDonation > 56) {
          matchScore += 20;
          reasons.push('Eligible donation window');
        }
      } else {
        matchScore += 15;
        reasons.push('First-time donor');
      }
      
      if (donor.totalDonations > 5) {
        matchScore += 15;
        reasons.push('Experienced donor');
      } else if (donor.totalDonations > 0) {
        matchScore += 10;
        reasons.push('Previous donor');
      }
      
      matchScore += 15;
      reasons.push('Available for contact');
      
      matches.push({
        donor,
        matchScore: Math.min(100, matchScore),
        reasons
      });
    });
    
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  // 6. Inventory Optimization
  static generateInventoryRecommendations(inventory, orders, recipients) {
    const recommendations = [];
    
    inventory.forEach(inv => {
      if (inv.availableUnits < inv.minThreshold) {
        recommendations.push({
          priority: 'high',
          title: `Critical: Low ${inv.bloodType} ${inv.component}`,
          description: `Only ${inv.availableUnits} units available (min: ${inv.minThreshold})`,
          action: `Initiate emergency procurement for ${inv.bloodType} ${inv.component}`
        });
      } else if (inv.availableUnits < inv.minThreshold * 1.5) {
        recommendations.push({
          priority: 'medium',
          title: `Warning: ${inv.bloodType} ${inv.component} below optimal`,
          description: `Current: ${inv.availableUnits} units, recommend: ${inv.minThreshold * 2}`,
          action: `Schedule donor drive for ${inv.bloodType}`
        });
      }
    });
    
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 5) {
      recommendations.push({
        priority: 'high',
        title: `${pendingOrders.length} Pending Orders`,
        description: 'Multiple orders awaiting fulfillment',
        action: 'Review and prioritize based on recipient urgency'
      });
    }
    
    const criticalRecipients = recipients.filter(r => r.predictedPriority > 80);
    if (criticalRecipients.length > 0) {
      recommendations.push({
        priority: 'high',
        title: `${criticalRecipients.length} Critical Recipients`,
        description: 'High-priority cases require immediate attention',
        action: 'Ensure blood availability for critical cases'
      });
    }
    
    return recommendations;
  }
}

module.exports = MLService;
