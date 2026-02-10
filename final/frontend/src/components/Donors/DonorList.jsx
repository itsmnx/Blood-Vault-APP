import React, { useState } from 'react';
import DonorForm from './DonorForm';
import DonorCard from './DonorCard';
import * as api from '../../services/api';

export default function DonorList({ donors, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async (data) => {
    try {
      await api.createDonor(token, data);
      onRefresh();
      setShowForm(false);
      alert('✅ Donor registered successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Register New Donor
        </button>
      )}

      {showForm && (
        <DonorForm 
          onSubmit={handleAdd} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Registered Donors</h2>
        {donors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No donors registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(donors) ? donors.map((d, idx) => (
              <DonorCard key={idx} donor={d} />
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No donors available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}