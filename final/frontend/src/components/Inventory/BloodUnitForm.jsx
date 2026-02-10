import React, { useState } from 'react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'Plasma', 'Platelets', 'RBC'];

export default function BloodUnitForm({ donors, onSubmit, onCancel }) {
  const EXPIRY_DAYS = {
    'Whole Blood': 35,
    'Plasma': 365,
    'Platelets': 5,
    'RBC': 42
  };

  const [form, setForm] = useState({
    bloodType: 'A+',
    component: 'Whole Blood',
    donorId: '',
    volume: 450,
    bagNumber: '',
    collectionDate: new Date().toISOString().split('T')[0] // Today's date
  });

  const calculateExpiryDate = (collectionDate, component) => {
    const collection = new Date(collectionDate);
    const expiryDays = EXPIRY_DAYS[component] || 35;
    const expiry = new Date(collection);
    expiry.setDate(expiry.getDate() + expiryDays);
    return expiry.toISOString().split('T')[0];
  };

  const getExpiryStatus = (collectionDate, component) => {
    const expiryDate = new Date(calculateExpiryDate(collectionDate, component));
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'red' };
    if (daysUntilExpiry <= 7) return { status: 'expiring', days: daysUntilExpiry, color: 'orange' };
    if (daysUntilExpiry <= 14) return { status: 'warning', days: daysUntilExpiry, color: 'yellow' };
    return { status: 'good', days: daysUntilExpiry, color: 'green' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.bagNumber.trim()) {
      alert('❗ Please provide a valid bag number.');
      return;
    }

    onSubmit({
      ...form,
      donorId: form.donorId || null,
      volume: parseInt(form.volume, 10),
      collectionDate: form.collectionDate,
      expiryDate: calculateExpiryDate(form.collectionDate, form.component)
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Add Blood Unit to Inventory
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
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
            Component
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

        {/* Donor */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Donor (optional)
          </label>
          <select
            value={form.donorId}
            onChange={(e) => setForm({ ...form, donorId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="">Select Donor</option>
            {Array.isArray(donors) && donors.length > 0 ? (
              donors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName} — {d.bloodType}
                </option>
              ))
            ) : (
              <option disabled>
                {Array.isArray(donors) ? `No donors available (${donors.length})` : 'Loading donors...'}
              </option>
            )}
          </select>
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-1">
              Debug: {Array.isArray(donors) ? `${donors.length} donors loaded` : 'Donors not loaded'}
            </p>
          )}
        </div>

        {/* Bag Number */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bag Number *
          </label>
          <input
            type="text"
            placeholder="Enter Bag Number"
            value={form.bagNumber}
            onChange={(e) => setForm({ ...form, bagNumber: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
        </div>

        {/* Collection Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Collection Date *
          </label>
          <input
            type="date"
            value={form.collectionDate}
            max={new Date().toISOString().split('T')[0]} // Can't be future date
            onChange={(e) => setForm({ ...form, collectionDate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Volume (mL)
          </label>
          <input
            type="number"
            placeholder="450"
            min="1"
            max="1000"
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {/* Expiry Information */}
        <div className="md:col-span-2 lg:col-span-3">
          {form.collectionDate && (
            <div className={`p-4 rounded-lg border-l-4 ${
              getExpiryStatus(form.collectionDate, form.component).color === 'red' ? 'bg-red-50 border-red-500' :
              getExpiryStatus(form.collectionDate, form.component).color === 'orange' ? 'bg-orange-50 border-orange-500' :
              getExpiryStatus(form.collectionDate, form.component).color === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">
                    📅 Expiry Date: {calculateExpiryDate(form.collectionDate, form.component)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Component lifespan: {EXPIRY_DAYS[form.component]} days
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  getExpiryStatus(form.collectionDate, form.component).color === 'red' ? 'bg-red-100 text-red-800' :
                  getExpiryStatus(form.collectionDate, form.component).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  getExpiryStatus(form.collectionDate, form.component).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getExpiryStatus(form.collectionDate, form.component).status === 'expired' ? '❌ Expired' :
                   getExpiryStatus(form.collectionDate, form.component).status === 'expiring' ? '⚠️ Expiring Soon' :
                   getExpiryStatus(form.collectionDate, form.component).status === 'warning' ? '⚡ Use Soon' :
                   '✅ Fresh'}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {getExpiryStatus(form.collectionDate, form.component).status === 'expired' 
                  ? `Expired ${getExpiryStatus(form.collectionDate, form.component).days} days ago`
                  : `${getExpiryStatus(form.collectionDate, form.component).days} days remaining`
                }
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 lg:col-span-3 flex gap-3">
          <button
            type="submit"
            disabled={getExpiryStatus(form.collectionDate, form.component).status === 'expired'}
            className={`flex-1 py-2 rounded-lg transition ${
              getExpiryStatus(form.collectionDate, form.component).status === 'expired'
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {getExpiryStatus(form.collectionDate, form.component).status === 'expired' 
              ? '❌ Cannot Add Expired Blood' 
              : '✅ Add to Inventory'
            }
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
