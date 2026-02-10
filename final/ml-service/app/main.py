from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import os

app = Flask(__name__)
CORS(app)

# ========================================
# ENHANCED ML MODELS
# ========================================

class PriorityPredictor:
    """Advanced priority prediction with multiple health factors"""
    
    @staticmethod
    def predict(recipient_data):
        score = 0
        factors = []
        
        # 1. Hemoglobin Level (25% weight)
        hb = recipient_data.get('hemoglobinLevel', 12)
        if hb < 6:
            hb_score = 25
        elif hb < 7:
            hb_score = 22
        elif hb < 8:
            hb_score = 18
        elif hb < 9:
            hb_score = 15
        elif hb < 10:
            hb_score = 10
        elif hb < 11:
            hb_score = 5
        else:
            hb_score = 0
        score += hb_score
        factors.append(f'Hemoglobin: {hb_score:.1f}')
        
        # 2. Blood Pressure (20% weight)
        systolic = recipient_data.get('systolicBP', 120)
        diastolic = recipient_data.get('diastolicBP', 80)
        
        if systolic < 90 or diastolic < 60:
            bp_score = 20
        elif systolic < 100 or diastolic < 65:
            bp_score = 15
        elif systolic < 110:
            bp_score = 10
        elif systolic > 180 or diastolic > 120:
            bp_score = 15
        else:
            bp_score = 0
        score += bp_score
        factors.append(f'Blood Pressure: {bp_score:.1f}')
        
        # 3. Heart Rate (15% weight)
        hr = recipient_data.get('heartRate', 75)
        if hr > 120 or hr < 50:
            hr_score = 15
        elif hr > 110 or hr < 55:
            hr_score = 10
        elif hr > 100 or hr < 60:
            hr_score = 5
        else:
            hr_score = 0
        score += hr_score
        factors.append(f'Heart Rate: {hr_score:.1f}')
        
        # 4. Age Factor (10% weight)
        age = recipient_data.get('age', 30)
        if age < 5:
            age_score = 10
        elif age < 12:
            age_score = 8
        elif age > 75:
            age_score = 9
        elif age > 65:
            age_score = 7
        elif age < 18:
            age_score = 5
        else:
            age_score = 0
        score += age_score
        factors.append(f'Age: {age_score:.1f}')
        
        # 5. Urgency Level (25% weight)
        urgency = recipient_data.get('urgencyLevel', 5)
        urgency_score = urgency * 2.5
        score += urgency_score
        factors.append(f'Urgency: {urgency_score:.1f}')
        
        # 6. Blood Loss (bonus)
        blood_loss = recipient_data.get('estimatedBloodLoss', 0)
        if blood_loss > 2000:
            score += 10
            factors.append('Severe blood loss: +10')
        elif blood_loss > 1000:
            score += 5
            factors.append('Moderate blood loss: +5')
        
        # 7. Surgery Requirement (bonus)
        if recipient_data.get('surgeryRequired', False):
            score += 8
            factors.append('Surgery required: +8')
        
        return {
            'score': min(100, round(score)),
            'factors': factors,
            'category': 'Critical' if score >= 80 else 'High' if score >= 60 else 'Medium' if score >= 40 else 'Low'
        }


class BloodLossPredictor:
    """Predict expected blood loss based on condition and surgery type"""
    
    @staticmethod
    def predict(patient_data):
        base_loss = 0
        factors = []
        
        # Condition-based estimation
        condition = patient_data.get('condition', '').lower()
        
        if 'trauma' in condition or 'accident' in condition:
            base_loss = 1500
            factors.append('Trauma: 1500ml base')
        elif 'surgery' in condition:
            surgery_type = patient_data.get('surgeryType', 'minor').lower()
            if 'major' in surgery_type or 'cardiac' in surgery_type:
                base_loss = 1000
                factors.append('Major surgery: 1000ml base')
            elif 'moderate' in surgery_type:
                base_loss = 600
                factors.append('Moderate surgery: 600ml base')
            else:
                base_loss = 300
                factors.append('Minor surgery: 300ml base')
        elif 'hemorrhage' in condition or 'bleeding' in condition:
            base_loss = 2000
            factors.append('Hemorrhage: 2000ml base')
        elif 'anemia' in condition:
            base_loss = 200
            factors.append('Anemia: 200ml base')
        else:
            base_loss = 500
            factors.append('General condition: 500ml base')
        
        # Hemoglobin adjustment
        hb = patient_data.get('hemoglobinLevel', 12)
        if hb < 7:
            base_loss += 500
            factors.append('Low Hb adjustment: +500ml')
        
        # Blood pressure adjustment
        systolic = patient_data.get('systolicBP', 120)
        if systolic < 90:
            base_loss += 400
            factors.append('Hypotension adjustment: +400ml')
        
        # Heart rate adjustment
        hr = patient_data.get('heartRate', 75)
        if hr > 120:
            base_loss += 300
            factors.append('Tachycardia adjustment: +300ml')
        
        return {
            'estimatedLoss': base_loss,
            'factors': factors,
            'severity': 'Critical' if base_loss > 2000 else 'Severe' if base_loss > 1000 else 'Moderate' if base_loss > 500 else 'Mild',
            'unitsNeeded': max(1, round(base_loss / 450)),  # 1 unit ≈ 450ml
            'transfusionUrgency': 'Immediate' if base_loss > 1500 else 'Urgent' if base_loss > 800 else 'Routine'
        }


class SurgeryPredictor:
    """Predict if surgery is required based on patient condition"""
    
    @staticmethod
    def predict(patient_data):
        surgery_score = 0
        indicators = []
        
        condition = patient_data.get('condition', '').lower()
        
        # Condition analysis
        surgical_keywords = ['fracture', 'trauma', 'appendicitis', 'tumor', 'obstruction', 
                            'rupture', 'perforation', 'gunshot', 'stab', 'internal bleeding']
        
        for keyword in surgical_keywords:
            if keyword in condition:
                surgery_score += 30
                indicators.append(f'Condition indicates {keyword}')
                break
        
        # Vital signs analysis
        hb = patient_data.get('hemoglobinLevel', 12)
        if hb < 7:
            surgery_score += 20
            indicators.append('Severe anemia may require surgical intervention')
        
        systolic = patient_data.get('systolicBP', 120)
        if systolic < 90:
            surgery_score += 15
            indicators.append('Hypotension suggests possible internal bleeding')
        
        hr = patient_data.get('heartRate', 75)
        if hr > 120:
            surgery_score += 10
            indicators.append('Tachycardia may indicate acute condition')
        
        # Age consideration
        age = patient_data.get('age', 30)
        if age < 5 or age > 75:
            surgery_score += 5
            indicators.append('Age group requires special surgical consideration')
        
        surgery_required = surgery_score >= 50
        confidence = min(100, surgery_score)
        
        return {
            'surgeryRequired': surgery_required,
            'confidence': confidence,
            'indicators': indicators,
            'recommendation': 'Immediate surgical consultation required' if surgery_score >= 70 
                            else 'Surgical evaluation recommended' if surgery_score >= 50 
                            else 'Monitor and reassess' if surgery_score >= 30 
                            else 'Medical management preferred',
            'urgency': 'Emergency' if surgery_score >= 70 else 'Urgent' if surgery_score >= 50 else 'Elective'
        }


class LocationOptimizer:
    """Find optimal donors/facilities based on location"""
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """Haversine formula for distance calculation"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def optimize(recipient_location, donors):
        """Find nearest compatible donors"""
        results = []
        
        recipient_lat = recipient_location.get('latitude', 0)
        recipient_lon = recipient_location.get('longitude', 0)
        recipient_blood_type = recipient_location.get('bloodType', 'O+')
        
        for donor in donors:
            donor_lat = donor.get('latitude', 0)
            donor_lon = donor.get('longitude', 0)
            
            distance = LocationOptimizer.calculate_distance(
                recipient_lat, recipient_lon, donor_lat, donor_lon
            )
            
            # Blood type compatibility
            compatible = DonorMatcher.check_compatibility(
                donor.get('bloodType'), recipient_blood_type
            )
            
            if compatible and donor.get('isEligible', True):
                travel_time = distance / 60 * 60  # Assuming 60 km/h average
                
                results.append({
                    'donor': donor,
                    'distance': round(distance, 2),
                    'travelTime': round(travel_time, 1),
                    'priority': 100 - min(100, distance * 2)
                })
        
        # Sort by distance
        results.sort(key=lambda x: x['distance'])
        
        return {
            'nearestDonors': results[:10],
            'totalFound': len(results),
            'averageDistance': round(sum(r['distance'] for r in results) / len(results), 2) if results else 0
        }


class DonorMatcher:
    """Smart donor matching algorithm"""
    
    @staticmethod
    def check_compatibility(donor_type, recipient_type):
        compatibility = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        }
        return recipient_type in compatibility.get(donor_type, [])
    
    @staticmethod
    def match(recipient, donors):
        matches = []
        
        for donor in donors:
            if not donor.get('isEligible', True):
                continue
            
            if not DonorMatcher.check_compatibility(donor['bloodType'], recipient['bloodType']):
                continue
            
            score = 0
            reasons = []
            
            # Exact match
            if donor['bloodType'] == recipient['bloodType']:
                score += 50
                reasons.append('Exact blood type match')
            else:
                score += 30
                reasons.append('Compatible blood type')
            
            # Recent donation
            last_donation = donor.get('lastDonationDate')
            if last_donation:
                days_since = (datetime.now() - datetime.fromisoformat(last_donation)).days
                if days_since > 56:
                    score += 20
                    reasons.append('Eligible donation window')
            else:
                score += 15
                reasons.append('First-time donor')
            
            # Experience
            total_donations = donor.get('totalDonations', 0)
            if total_donations > 5:
                score += 15
                reasons.append('Experienced donor')
            elif total_donations > 0:
                score += 10
                reasons.append('Previous donor')
            
            # Availability
            score += 15
            reasons.append('Available for contact')
            
            matches.append({
                'donor': donor,
                'matchScore': min(100, score),
                'reasons': reasons
            })
        
        return sorted(matches, key=lambda x: x['matchScore'], reverse=True)[:5]


class DemandForecaster:
    """Forecast blood demand for next 7 days"""
    
    @staticmethod
    def forecast(historical_orders):
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        predictions = {}
        
        for blood_type in blood_types:
            # Filter orders for this blood type
            type_orders = [o for o in historical_orders if o.get('bloodType') == blood_type]
            
            if len(type_orders) > 0:
                avg_demand = sum(o.get('unitsRequested', 1) for o in type_orders) / len(type_orders)
            else:
                avg_demand = 5
            
            # Seasonal adjustments
            current_day = datetime.now().weekday()
            weekend_multiplier = 0.8 if current_day in [5, 6] else 1.1
            
            # Random variation (±20%)
            import random
            variation = 0.8 + random.random() * 0.4
            
            predictions[blood_type] = max(1, round(avg_demand * weekend_multiplier * variation * 7))
        
        # Generate insight
        high_demand = [bt for bt, demand in predictions.items() if demand > 15]
        
        insight = f"High demand predicted for {', '.join(high_demand)}. Increase stock levels." if high_demand else "Demand levels normal. Monitor inventory."
        
        return {
            'predictions': predictions,
            'insight': insight,
            'forecastPeriod': '7 days',
            'confidence': 'High' if len(historical_orders) > 50 else 'Medium' if len(historical_orders) > 20 else 'Low'
        }


class RiskAssessor:
    """Comprehensive risk assessment"""
    
    @staticmethod
    def assess(patient_data):
        risk = 0
        factors = []
        
        # Hemoglobin risk
        hb = patient_data.get('hemoglobinLevel', 12)
        if hb < 6:
            risk += 40
            factors.append('Critical anemia (Hb < 6)')
        elif hb < 7:
            risk += 30
            factors.append('Severe anemia (Hb < 7)')
        elif hb < 9:
            risk += 20
            factors.append('Moderate anemia (Hb < 9)')
        
        # Blood pressure risk
        systolic = patient_data.get('systolicBP', 120)
        if systolic < 80:
            risk += 35
            factors.append('Severe hypotension (SBP < 80)')
        elif systolic < 90:
            risk += 25
            factors.append('Hypotension (SBP < 90)')
        
        # Heart rate risk
        hr = patient_data.get('heartRate', 75)
        if hr > 130:
            risk += 25
            factors.append('Severe tachycardia (HR > 130)')
        elif hr > 120:
            risk += 20
            factors.append('Tachycardia (HR > 120)')
        elif hr < 45:
            risk += 20
            factors.append('Bradycardia (HR < 45)')
        
        # Age risk
        age = patient_data.get('age', 30)
        if age < 1:
            risk += 15
            factors.append('Neonatal age group')
        elif age > 80:
            risk += 15
            factors.append('Advanced age (> 80)')
        elif age > 75:
            risk += 10
            factors.append('Elderly (> 75)')
        
        # Blood loss risk
        blood_loss = patient_data.get('estimatedBloodLoss', 0)
        if blood_loss > 2000:
            risk += 20
            factors.append('Massive blood loss (> 2L)')
        elif blood_loss > 1000:
            risk += 10
            factors.append('Significant blood loss (> 1L)')
        
        return {
            'riskScore': min(100, risk),
            'riskLevel': 'Critical' if risk >= 70 else 'High' if risk >= 50 else 'Moderate' if risk >= 30 else 'Low',
            'factors': factors,
            'recommendation': RiskAssessor._get_recommendation(risk)
        }
    
    @staticmethod
    def _get_recommendation(risk):
        if risk >= 70:
            return 'Immediate intervention required. Prepare for emergency transfusion and ICU admission.'
        elif risk >= 50:
            return 'Urgent medical attention needed. Prioritize for transfusion and close monitoring.'
        elif risk >= 30:
            return 'Monitor closely. Prepare for potential transfusion based on clinical status.'
        else:
            return 'Routine monitoring. Standard protocols apply.'


# ========================================
# API ROUTES
# ========================================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Blood Vault ML Service', 'version': '2.0'})


@app.route('/predict/priority', methods=['POST'])
def predict_priority():
    try:
        data = request.json
        result = PriorityPredictor.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict/blood-loss', methods=['POST'])
def predict_blood_loss():
    try:
        data = request.json
        result = BloodLossPredictor.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict/surgery', methods=['POST'])
def predict_surgery():
    try:
        data = request.json
        result = SurgeryPredictor.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict/risk', methods=['POST'])
def assess_risk():
    try:
        data = request.json
        result = RiskAssessor.assess(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/match/donors', methods=['POST'])
def match_donors():
    try:
        data = request.json
        recipient = data.get('recipient', {})
        donors = data.get('donors', [])
        result = DonorMatcher.match(recipient, donors)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/optimize/location', methods=['POST'])
def optimize_location():
    try:
        data = request.json
        recipient_location = data.get('recipientLocation', {})
        donors = data.get('donors', [])
        result = LocationOptimizer.optimize(recipient_location, donors)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/forecast/demand', methods=['POST'])
def forecast_demand():
    try:
        data = request.json
        historical_orders = data.get('orders', [])
        result = DemandForecaster.forecast(historical_orders)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/analyze/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """Complete analysis for a recipient"""
    try:
        data = request.json
        
        # Run all predictions
        priority = PriorityPredictor.predict(data)
        blood_loss = BloodLossPredictor.predict(data)
        surgery = SurgeryPredictor.predict(data)
        risk = RiskAssessor.assess(data)
        
        return jsonify({
            'priority': priority,
            'bloodLoss': blood_loss,
            'surgery': surgery,
            'risk': risk,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print("🤖 Blood Vault ML Service starting...")
    print("📊 Enhanced predictions: Priority, Blood Loss, Surgery, Risk, Location")
    app.run(host='0.0.0.0', port=5001, debug=True)