import React, { useState } from 'react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'Plasma', 'Platelets', 'RBC'];

export default function OrderForm({ recipients, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    recipientId: '',
    bloodType: 'A+',
    component: 'Whole Blood',
    unitsRequested: 1,
    urgency: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.recipientId) {
      alert('⚠️ Please select a recipient to proceed.');
      return;
    }

    onSubmit({
      ...form,
      unitsRequested: parseInt(form.unitsRequested, 10),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Blood Order</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Recipient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Recipient *
          </label>
          <select
            value={form.recipientId}
            onChange={(e) => {
              const recipient = Array.isArray(recipients) ? recipients.find((r) => r._id === e.target.value) : null;
              setForm({
                ...form,
                recipientId: e.target.value,
                bloodType: recipient ? recipient.bloodType : form.bloodType,
              });
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          >
            <option value="">Select Recipient</option>
            {Array.isArray(recipients) && recipients.length > 0 ? (
              recipients
                .sort((a, b) => (b.predictedPriority || 0) - (a.predictedPriority || 0))
                .map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fullName} — {r.bloodType} ({r.hospital || 'N/A'}) 
                    {r.predictedPriority ? ` • Priority: ${r.predictedPriority}%` : ''}
                  </option>
                ))
            ) : (
              <option disabled>No recipients available</option>
            )}
          </select>
        </div>

        {/* Blood Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Blood Type
          </label>
          <select
            value={form.bloodType}
            onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>

        {/* Component */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Blood Component
          </label>
          <select
            value={form.component}
            onChange={(e) => setForm({ ...form, component: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            {COMPONENTS.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>
        </div>

        {/* Units Requested */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Units Requested
          </label>
          <input
            type="number"
            placeholder="1"
            min="1"
            value={form.unitsRequested}
            onChange={(e) =>
              setForm({ ...form, unitsRequested: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Urgency
          </label>
          <select
            value={form.urgency}
            onChange={(e) => setForm({ ...form, urgency: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
              form.urgency === 'critical'
                ? 'ring-red-600 bg-red-50'
                : form.urgency === 'high'
                ? 'ring-orange-500 bg-orange-50'
                : form.urgency === 'medium'
                ? 'ring-yellow-500 bg-yellow-50'
                : 'ring-green-500 bg-green-50'
            }`}
          >
            <option value="low">Low Urgency</option>
            <option value="medium">Medium Urgency</option>
            <option value="high">High Urgency</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 items-end">
          <button
            type="submit"
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Create Order
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
