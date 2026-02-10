module.exports = {
  BLOOD_TYPES: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  
  BLOOD_COMPONENTS: ['Whole Blood', 'Plasma', 'Platelets', 'RBC'],
  
  EXPIRY_DAYS: {
    'Whole Blood': 35,
    'Plasma': 365,
    'Platelets': 5,
    'RBC': 42
  },
  
  URGENCY_LEVELS: ['low', 'medium', 'high', 'critical'],
  
  ORDER_STATUS: ['pending', 'fulfilled', 'cancelled'],
  
  BLOOD_COMPATIBILITY: {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  }
};