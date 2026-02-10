import React from 'react';

export default function DemandForecast({ forecast }) {
  if (!forecast) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Demand Forecasting (Next 7 Days)</h2>
      <div className="space-y-3">
        {Object.entries(forecast.predictions || {}).map(([bloodType, demand]) => (
          <div key={bloodType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg w-12">{bloodType}</span>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded-full w-48">
                  <div 
                    className="h-3 bg-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (demand / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{demand} units</p>
              <p className="text-xs text-gray-500">predicted demand</p>
            </div>
          </div>
        ))}
        {forecast.insight && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ML Insight:</strong> {forecast.insight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}