import React from 'react';

export default function DonorCard({ donor }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">{donor.fullName}</h3>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
          {donor.bloodType}
        </span>
      </div>
      <p className="text-sm text-gray-600">Phone: {donor.phone}</p>
      <p className="text-sm text-gray-600">Total Donations: {donor.totalDonations}</p>
      <p className={`text-sm font-medium mt-2 ${donor.isEligible ? 'text-green-600' : 'text-red-600'}`}>
        {donor.isEligible ? 'Eligible to Donate' : 'Not Eligible'}
      </p>
    </div>
  );
}