import React, { useState } from 'react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RecipientForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    fullName: '',
    bloodType: 'A+',
    phone: '',
    hospital: '',
    urgencyLevel: 5,
    hemoglobinLevel: '',
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    age: '',
    requiredUnits: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.fullName || !form.age || !form.hemoglobinLevel) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...form,
      hemoglobinLevel: parseFloat(form.hemoglobinLevel),
      systolicBP: parseInt(form.systolicBP),
      diastolicBP: parseInt(form.diastolicBP),
      heartRate: parseInt(form.heartRate),
      age: parseInt(form.age)
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Recipient</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Full Name *"
          value={form.fullName}
          onChange={(e) => setForm({...form, fullName: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        <select
          value={form.bloodType}
          onChange={(e) => setForm({...form, bloodType: e.target.value})}
          className="px-4 py-2 border rounded-lg"
        >
          {BLOOD_TYPES.map(bt => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({...form, phone: e.target.value})}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Hospital"
          value={form.hospital}
          onChange={(e) => setForm({...form, hospital: e.target.value})}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Age *"
          value={form.age}
          onChange={(e) => setForm({...form, age: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          step="0.1"
          placeholder="Hemoglobin (g/dL) *"
          value={form.hemoglobinLevel}
          onChange={(e) => setForm({...form, hemoglobinLevel: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Systolic BP *"
          value={form.systolicBP}
          onChange={(e) => setForm({...form, systolicBP: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Diastolic BP *"
          value={form.diastolicBP}
          onChange={(e) => setForm({...form, diastolicBP: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Heart Rate *"
          value={form.heartRate}
          onChange={(e) => setForm({...form, heartRate: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        
        <div className="md:col-span-3 flex gap-3">
          <button 
            type="submit"
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Add Recipient (ML Priority Auto-Calculated)
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}