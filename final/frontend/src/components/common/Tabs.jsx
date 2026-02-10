import React from 'react';

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 px-4 py-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow'
                : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
