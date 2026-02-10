import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

export default function BloodUnitsView({ token, onRefresh }) {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    loadBloodUnits();
  }, [showExpired]);

  const loadBloodUnits = async () => {
    setLoading(true);
    try {
      const units = await api.getBloodUnits(token, showExpired);
      setBloodUnits(units || []);
    } catch (error) {
      console.error('Error loading blood units:', error);
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId, bagNumber) => {
    if (!window.confirm(`Are you sure you want to delete blood unit ${bagNumber}?`)) return;
    
    try {
      await api.deleteBloodUnit(token, unitId);
      await loadBloodUnits();
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error deleting blood unit: ' + error.message);
    }
  };

  const handleCleanupExpired = async () => {
    if (!window.confirm('Are you sure you want to delete ALL expired blood units? This action cannot be undone.')) return;
    
    try {
      const result = await api.deleteExpiredBlood(token);
      alert(`Successfully removed ${result.deletedCount} expired blood unit(s)`);
      await loadBloodUnits();
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error cleaning up expired blood: ' + error.message);
    }
  };

  const getStatusBadge = (status, daysUntilExpiry) => {
    const badges = {
      expired: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Expired' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', icon: '🚨', label: 'Critical' },
      expiring: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '⚠️', label: 'Expiring Soon' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚡', label: 'Use Soon' },
      fresh: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Fresh' }
    };

    const badge = badges[status] || badges.fresh;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon} {badge.label}
        {status !== 'expired' && ` (${daysUntilExpiry}d)`}
        {status === 'expired' && ` (${Math.abs(daysUntilExpiry)}d ago)`}
      </span>
    );
  };

  const filteredUnits = bloodUnits.filter(unit => {
    if (filter === 'all') return true;
    if (filter === 'expiring') return ['critical', 'expiring'].includes(unit.expiryStatus);
    if (filter === 'expired') return unit.expiryStatus === 'expired';
    return unit.bloodType === filter;
  });

  const expiredCount = bloodUnits.filter(unit => unit.expiryStatus === 'expired').length;
  const expiringCount = bloodUnits.filter(unit => ['critical', 'expiring'].includes(unit.expiryStatus)).length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🩸 Blood Units Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track individual blood units and expiry dates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCleanupExpired}
            disabled={expiredCount === 0}
            className={`px-4 py-2 rounded-lg transition ${
              expiredCount > 0 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🗑️ Cleanup Expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-semibold">Total Units</p>
          <p className="text-2xl font-bold text-blue-800">{bloodUnits.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-semibold">Fresh Units</p>
          <p className="text-2xl font-bold text-green-800">
            {bloodUnits.filter(unit => unit.expiryStatus === 'fresh').length}
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-semibold">Expiring Soon</p>
          <p className="text-2xl font-bold text-orange-800">{expiringCount}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 font-semibold">Expired</p>
          <p className="text-2xl font-bold text-red-800">{expiredCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="all">All Units</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="A+">A+ Units</option>
          <option value="A-">A- Units</option>
          <option value="B+">B+ Units</option>
          <option value="B-">B- Units</option>
          <option value="AB+">AB+ Units</option>
          <option value="AB-">AB- Units</option>
          <option value="O+">O+ Units</option>
          <option value="O-">O- Units</option>
        </select>
        
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">Include Expired Units</span>
        </label>
      </div>

      {/* Blood Units Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blood units...</p>
        </div>
      ) : filteredUnits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bag Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Blood Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Component</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Volume</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Collection Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Expiry Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Donor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit, idx) => (
                <tr key={unit._id} className={`border-b hover:bg-gray-50 transition ${
                  unit.expiryStatus === 'expired' ? 'bg-red-25' : 
                  unit.expiryStatus === 'critical' ? 'bg-red-25' :
                  unit.expiryStatus === 'expiring' ? 'bg-orange-25' : ''
                }`}>
                  <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                    {unit.bagNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                      {unit.bloodType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{unit.component}</td>
                  <td className="py-3 px-4 text-gray-700">{unit.volume} mL</td>
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(unit.collectionDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(unit.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(unit.expiryStatus, unit.daysUntilExpiry)}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {unit.donorId ? unit.donorId.fullName : 'Anonymous'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDeleteUnit(unit._id, unit.bagNumber)}
                      className="text-red-600 hover:text-red-800 transition text-sm font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🩸</div>
          <p className="text-gray-600">No blood units found matching your criteria</p>
        </div>
      )}
    </div>
  );
}