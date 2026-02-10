import React, { useState } from 'react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    fullName: '',
    bloodType: 'A+',
    phone: '',
    address: '',
    dateOfBirth: '',
    medicalHistory: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      alert('Please fill in required fields (Name and Phone)');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Register New Donor</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          placeholder="Phone *"
          value={form.phone}
          onChange={(e) => setForm({...form, phone: e.target.value})}
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={form.dateOfBirth}
          onChange={(e) => setForm({...form, dateOfBirth: e.target.value})}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({...form, address: e.target.value})}
          className="px-4 py-2 border rounded-lg md:col-span-2"
        />
        <textarea
          placeholder="Medical History"
          value={form.medicalHistory}
          onChange={(e) => setForm({...form, medicalHistory: e.target.value})}
          className="px-4 py-2 border rounded-lg md:col-span-2"
          rows="3"
        />
        <div className="md:col-span-2 flex gap-3">
          <button 
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Register Donor
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
