import React from 'react';
import { Users, Activity, Package, AlertCircle, TrendingUp, Droplet } from 'lucide-react';
import StatCard from './StatCard';

export default function Dashboard({ data, onRefresh }) {
  const { recipients = [], donors = [], inventory = [], orders = [] } = data || {};

  const totalUnits = inventory.reduce((sum, inv) => sum + inv.availableUnits, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users />} title="Total Donors" value={donors.length} color="blue" />
        <StatCard icon={<Activity />} title="Recipients" value={recipients.length} color="red" />
        <StatCard icon={<Package />} title="Blood Units" value={totalUnits} color="green" />
        <StatCard icon={<AlertCircle />} title="Pending Orders" value={pendingOrders} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-red-600" />
          High Priority Recipients (ML Predicted)
        </h2>
        {recipients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recipients yet.</p>
        ) : (
          <div className="space-y-3">
            {recipients
              .sort((a, b) => (b.predictedPriority || 0) - (a.predictedPriority || 0))
              .slice(0, 5)
              .map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{r.fullName}</p>
                    <p className="text-sm text-gray-600">{r.bloodType} • {r.hospital || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      r.predictedPriority >= 80 ? 'text-red-600' :
                      r.predictedPriority >= 60 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {r.predictedPriority}%
                    </div>
                    <p className="text-xs text-gray-500">Priority Score</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Inventory Status</h2>
        {inventory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No inventory data available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory && inventory.map((inv, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{inv.bloodType}</span>
                  <Droplet className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm text-gray-600">{inv.component}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{inv.availableUnits}</p>
                <p className="text-xs text-gray-500">units available</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}