import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/common/Navbar';
import Tabs from './components/common/Tabs';
import Dashboard from './components/Dashboard/Dashboard';
import RecipientList from './components/Recipients/RecipientList';
import DonorList from './components/Donors/DonorList';
import InventoryList from './components/Inventory/InventoryList';
import OrderList from './components/Orders/OrderList';
import MLDashboard from './components/MLInsights/MLDashboard';
import { useAuth } from './hooks/useAuth';
import * as api from './services/api';

export default function App() {
  const { token, user, login, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [data, setData] = useState({
    recipients: [],
    donors: [],
    inventory: [],
    orders: [],
    mlInsights: null,
    demandForecast: null
  });

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      const [
        recipients,
        donors,
        inventory,
        orders,
        mlInsights,
        demandForecast
      ] = await Promise.all([
        api.getRecipients(token),
        api.getDonors(token),
        api.getInventory(token),
        api.getOrders(token),
        api.getMLInsights(token),
        api.getDemandForecast(token)
      ]);

      setData({
        recipients,
        donors,
        inventory,
        orders,
        mlInsights,
        demandForecast
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    // Update the user data in the auth hook
    console.log('Updating user data:', updatedUser);
    
    // Update local user state immediately
    updateUser(updatedUser);
    
    // In a real implementation, you would also call an API to persist the changes
    // try {
    //   await api.updateUser(token, updatedUser);
    // } catch (error) {
    //   console.error('Failed to update user on server:', error);
    //   // Optionally revert the local changes if server update fails
    // }
  };

  // ==========================
  // AUTH SCREENS
  // ==========================
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        {authMode === 'login' ? (
          <Login
            onLogin={login}
            onSwitchMode={() => setAuthMode('register')}
          />
        ) : (
          <Register
            onRegister={() => setAuthMode('login')}
            onSwitchMode={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  // ==========================
  // MAIN APP VIEW
  // ==========================
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'recipients', label: 'Recipients' },
    { id: 'donors', label: 'Donors' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'orders', label: 'Orders' },
    { id: 'ml-insights', label: 'ML Insights' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar user={user} onLogout={logout} onUserUpdate={handleUserUpdate} />

      {/* Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'dashboard' && (
            <Dashboard data={data} onRefresh={loadData} />
          )}
          {activeTab === 'recipients' && (
            <RecipientList
              recipients={data.recipients}
              token={token}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'donors' && (
            <DonorList
              donors={data.donors}
              token={token}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryList
              inventory={data.inventory}
              donors={data.donors}
              token={token}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'orders' && (
            <OrderList
              orders={data.orders}
              recipients={data.recipients}
              inventory={data.inventory}
              token={token}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'ml-insights' && (
            <MLDashboard
              insights={data.mlInsights}
              forecast={data.demandForecast}
              recipients={data.recipients}
              token={token}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>

    </div>
  );
}
