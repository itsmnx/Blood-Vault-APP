const Recipient = require('../models/Recipient');
const MLService = require('../services/ml.service');

exports.getAllRecipients = async (req, res, next) => {
  try {
    const recipients = await Recipient.find().sort({ predictedPriority: -1 });
    res.json(recipients);
  } catch (error) {
    next(error);
  }
};

exports.createRecipient = async (req, res, next) => {
  try {
    const recipientData = req.body;
    
    // Apply ML models
    const priorityResult = await MLService.advancedPriorityPrediction(recipientData);
    recipientData.predictedPriority = priorityResult.score;
    recipientData.riskScore = await MLService.calculateRiskScore(recipientData);
    recipientData.survivalProbability = await MLService.predictSurvivalProbability(recipientData);
    
    const recipient = await Recipient.create(recipientData);
    
    res.status(201).json({
      ...recipient.toObject(),
      mlInsights: {
        priorityFactors: priorityResult.factors,
        riskLevel: recipientData.riskScore > 60 ? 'High' : 
                   recipientData.riskScore > 30 ? 'Medium' : 'Low'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecipientById = async (req, res, next) => {
  try {
    const recipient = await Recipient.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    res.json(recipient);
  } catch (error) {
    next(error);
  }
};