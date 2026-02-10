const Donor = require('../models/Donor');

exports.getAllDonors = async (req, res, next) => {
  try {
    const donors = await Donor.find().populate('userId');
    res.json(donors);
  } catch (error) {
    next(error);
  }
};

exports.createDonor = async (req, res, next) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json(donor);
  } catch (error) {
    next(error);
  }
};

exports.getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id).populate('userId');
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    next(error);
  }
};

exports.updateDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    next(error);
  }
};