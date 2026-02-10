import React, { useState } from 'react';
import * as api from '../../services/api';

export default function DonorMatching({ recipients, token }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');

  const handleFindMatches = async (recipientId) => {
    if (!recipientId) {
      setMatches([]);
      setSelectedRecipient('');
      return;
    }
    
    setLoading(true);
    setError('');
    setSelectedRecipient(recipientId);
    
    try {
      const data = await api.matchDonors(token, recipientId);
      setMatches(data || []);
    } catch (error) {
      console.error('Error finding matches:', error);
      setError(error.message || 'Failed to find donor matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Smart Donor Matching</h2>
      <p className="text-sm text-gray-600 mb-4">Select a recipient to find optimal donor matches using ML</p>
      
      <div className="relative">
        <select 
          value={selectedRecipient}
          onChange={(e) => handleFindMatches(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg mb-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a recipient...</option>
          {Array.isArray(recipients) && recipients.length > 0 ? (
            recipients.map((r) => (
              <option key={r._id} value={r._id}>
                {r.fullName} - {r.bloodType} {r.predictedPriority ? `(Priority: ${r.predictedPriority}%)` : ''}
              </option>
            ))
          ) : (
            <option disabled>No recipients available</option>
          )}
        </select>
        
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && selectedRecipient && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding optimal donor matches...</p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Top Matched Donors:</h3>
            <span className="text-sm text-gray-500">{matches.length} matches found</span>
          </div>
          {matches.map((match, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{match.donor.fullName || 'Anonymous Donor'}</p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {match.donor.bloodType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    📞 {match.donor.phone || 'No phone'} • 📧 {match.donor.email || 'No email'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-gray-500">
                      🩸 Total Donations: {match.donor.totalDonations || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: {match.donor.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
                    </p>
                    {match.donor.lastDonationDate && (
                      <p className="text-xs text-gray-500">
                        Last Donation: {new Date(match.donor.lastDonationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-2xl font-bold ${
                    match.matchScore >= 80 ? 'text-green-600' :
                    match.matchScore >= 60 ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {match.matchScore}%
                  </div>
                  <p className="text-xs text-gray-500">Match Score</p>
                  <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                    match.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                    match.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {match.matchScore >= 80 ? 'Excellent' :
                     match.matchScore >= 60 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                <p className="text-xs text-gray-700 font-medium mb-1">Match Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {(match.reasons || []).map((reason, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selectedRecipient && matches.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <p className="text-gray-600">No compatible donors found for this recipient.</p>
          <p className="text-sm text-gray-500 mt-1">Try selecting a different recipient or add more donors to the system.</p>
        </div>
      )}
    </div>
  );
}