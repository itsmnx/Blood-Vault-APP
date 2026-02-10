import React from 'react';

export default function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}