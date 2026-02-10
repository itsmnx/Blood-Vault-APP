import React, { useState } from 'react';
import RecipientForm from './RecipientForm';
import * as api from '../../services/api';

export default function RecipientList({ recipients, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async (data) => {
    try {
      await api.createRecipient(token, data);
      onRefresh();
      setShowForm(false);
      alert('✅ Recipient added successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
        >
          + Add New Recipient
        </button>
      )}

      {showForm && (
        <RecipientForm 
          onSubmit={handleAdd} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Recipients</h2>
        {recipients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recipients added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Blood Type</th>
                  <th className="text-left py-3 px-4">Hospital</th>
                  <th className="text-left py-3 px-4">ML Priority</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(recipients) && recipients.length > 0 ? recipients.sort((a, b) => (b.predictedPriority || 0) - (a.predictedPriority || 0)).map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{r.fullName}</td>
                    <td className="py-3 px-4">{r.bloodType}</td>
                    <td className="py-3 px-4">{r.hospital || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        r.predictedPriority >= 80 ? 'bg-red-100 text-red-800' :
                        r.predictedPriority >= 60 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.predictedPriority}%
                      </span>
                    </td>
                    <td className="py-3 px-4">{r.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No recipients available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
