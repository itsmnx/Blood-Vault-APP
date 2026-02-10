import React from 'react';

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Real-time Recommendations</h2>
        <p className="text-gray-500 text-center py-8">No recommendations at this time</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Real-time Recommendations</h2>
      <div className="space-y-3">
        {Array.isArray(recommendations) && recommendations.length > 0 ? recommendations.map((rec, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-l-4 ${
            rec.priority === 'high' ? 'bg-red-50 border-red-500' :
            rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
            'bg-blue-50 border-blue-500'
          }`}>
            <p className="font-semibold text-gray-800">{rec.title}</p>
            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
            <p className="text-xs text-gray-500 mt-2">Action: {rec.action}</p>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No recommendations available at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}