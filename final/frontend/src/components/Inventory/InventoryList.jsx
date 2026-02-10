import React, { useState, useEffect } from 'react';
import { Droplet, Trash2, Plus } from 'lucide-react';
import * as api from '../../services/api';

export default function InventoryList({ inventory, donors, token, onRefresh }) {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    bloodType: 'A+',
    component: 'Whole Blood',
    donorId: '',
    volume: 450,
    bagNumber: '',
    collectionDate: new Date().toISOString().split('T')[0]
  });

  const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const COMPONENTS = ['Whole Blood', 'Plasma', 'Platelets', 'Red Blood Cells'];

  useEffect(() => {
    loadBloodUnits();
  }, [token]);

  const loadBloodUnits = async () => {
    setLoading(true);
    try {
      const units = await api.getBloodUnits(token, true);
      setBloodUnits(units || []);
    } catch (error) {
      console.error('Error loading blood units:', error);
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.bagNumber.trim()) {
      alert('Please enter a bag number');
      return;
    }

    try {
      const bloodData = {
        ...form,
        donorId: form.donorId || null,
        volume: parseInt(form.volume, 10)
      };

      await api.createBloodUnit(token, bloodData);
      await loadBloodUnits();
      if (onRefresh) onRefresh();
      
      // Reset form and hide it
      setForm({
        bloodType: 'A+',
        component: 'Whole Blood',
        donorId: '',
        volume: 450,
        bagNumber: '',
        collectionDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      
      alert('✅ Blood unit added successfully!');
    } catch (error) {
      console.error('Error adding blood unit:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleDelete = async (unitId, bagNumber) => {
    if (!window.confirm(`Are you sure you want to delete blood unit ${bagNumber}?`)) return;
    
    try {
      await api.deleteBloodUnit(token, unitId);
      await loadBloodUnits();
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error deleting blood unit: ' + error.message);
    }
  };

  const getStatusBadge = (unit) => {
    if (!unit.expiryStatus) return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    
    const statusConfig = {
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
      expiring: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Expiring' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Warning' },
      fresh: { bg: 'bg-green-100', text: 'text-green-800', label: 'Fresh' }
    };

    const config = statusConfig[unit.expiryStatus] || statusConfig.fresh;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Droplet className="text-red-600" />
          Blood Inventory Management
        </h1>
        <p className="text-gray-600 mt-2">Add and manage blood units in the inventory</p>
      </div>

      {/* Add Blood Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Blood Unit</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Plus size={16} />
            {showForm ? 'Cancel' : 'Add Blood'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              <select
                value={form.bloodType}
                onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Component */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Component</label>
              <select
                value={form.component}
                onChange={(e) => setForm({ ...form, component: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {COMPONENTS.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            {/* Donor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donor (Optional)</label>
              <select
                value={form.donorId}
                onChange={(e) => setForm({ ...form, donorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Select Donor</option>
                {Array.isArray(donors) && donors.map((donor) => (
                  <option key={donor._id} value={donor._id}>
                    {donor.fullName} - {donor.bloodType}
                  </option>
                ))}
              </select>
            </div>

            {/* Bag Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bag Number *</label>
              <input
                type="text"
                placeholder="Enter bag number"
                value={form.bagNumber}
                onChange={(e) => setForm({ ...form, bagNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Volume (mL)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Collection Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Collection Date</label>
              <input
                type="date"
                value={form.collectionDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, collectionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Add Blood Unit
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Blood Units Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Blood Records ({bloodUnits.length})</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blood units...</p>
          </div>
        ) : bloodUnits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bag Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bloodUnits.map((unit) => (
                  <tr key={unit._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                      {unit.bagNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                        {unit.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {unit.component}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {unit.volume} mL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(unit.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(unit.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(unit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {unit.donorId?.fullName || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(unit._id, unit.bagNumber)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No blood units available</p>
            <p className="text-sm text-gray-500 mt-2">Add your first blood unit using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
}