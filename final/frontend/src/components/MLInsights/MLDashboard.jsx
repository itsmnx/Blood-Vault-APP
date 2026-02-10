import React, { useState } from 'react';
import DemandForecast from './DemandForecast';
import DonorMatching from './DonorMatching';
import Recommendations from './Recommendations';
import * as api from '../../services/api';

export default function MLDashboard({ insights, forecast, recipients, token }) {
  const [nearestDonors, setNearestDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // ============================
  // GET USER LOCATION & CALL API
  // ============================
  const handleLocationOptimization = () => {
    setLocationError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          // Call ML backend API
          const data = await api.optimizeLocation(token, {
            latitude,
            longitude,
            bloodType: recipients?.[0]?.bloodType || "O+",
          });

          setNearestDonors(data.nearestDonors || []);
        } catch (err) {
          setLocationError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationError("Location access denied.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* MAIN INSIGHTS */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          🤖 ML-Powered Analytics Dashboard
        </h2>

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-semibold">
                Risk Assessment
              </p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {insights.criticalRecipients || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Critical cases detected
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-semibold">
                Optimization Score
              </p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {insights.optimizationScore || 0}%
              </p>
              <p className="text-xs text-green-600 mt-1">System efficiency</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-semibold">
                Stock Alerts
              </p>
              <p className="text-2xl font-bold text-orange-800 mt-1">
                {insights.stockAlerts || 0}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Low inventory warnings
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LOCATION-BASED DONOR OPTIMIZATION */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          📍 Location-Based Donor Optimization
        </h2>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={handleLocationOptimization}
          disabled={loading}
        >
          {loading ? "Finding nearest donors..." : "Find Nearest Donors"}
        </button>

        {locationError && (
          <p className="text-red-600 text-sm mt-3">{locationError}</p>
        )}

        {nearestDonors.length > 0 && (
          <div className="mt-5 space-y-3">
            <h3 className="font-semibold text-gray-700">Nearest Compatible Donors:</h3>

            {nearestDonors.map((d, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="text-gray-800 font-medium">{d.donor.name || "Unknown Donor"}</p>
                  <p className="text-sm text-gray-600">
                    Blood Type: <strong>{d.donor.bloodType}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-semibold">{d.distance} km</p>
                  <p className="text-xs text-gray-600">{d.travelTime} min ETA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTHER EXISTING ML COMPONENTS */}
      <DemandForecast forecast={forecast} />
      <DonorMatching recipients={recipients} token={token} />
      <Recommendations recommendations={insights?.recommendations} />
    </div>
  );
}
