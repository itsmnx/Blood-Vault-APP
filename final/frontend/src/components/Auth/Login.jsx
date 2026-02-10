import React, { useState } from 'react';
import { Droplet } from 'lucide-react';
import * as api from '../../services/api';

export default function Login({ onLogin, onSwitchMode }) {
  const [form, setForm] = useState({ email: '', password: '', userType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Now sending userType also
      const data = await api.login(form.email, form.password, form.userType);

      if (data.token) {
        onLogin(data.token, data.user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 via-white to-red-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Droplet className="text-red-600 w-12 h-12 mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">Blood Vault</h1>
          <p className="text-gray-500 text-sm mt-1">Life Flows Through Code ❤️</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            className="px-4 py-2 font-semibold text-red-600 border-b-2 border-red-600"
            disabled
          >
            Login
          </button>
          <button
            className="px-4 py-2 text-gray-500 hover:text-red-600"
            onClick={onSwitchMode}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {/* User Type Dropdown */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">User Type</label>
            <select
              value={form.userType}
              onChange={(e) => setForm({ ...form, userType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select Role</option>
              <option value="donor">Donor</option>
              <option value="recipient">Recipient</option>
              <option value="employee">Employee</option>
              <option value="hospital">Hospital Staff</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Message */}
        <div className="mt-6 text-center text-xs text-gray-500">
          ⚠️ Backend Required: Ensure the API server is running on{' '}
          <span className="font-semibold text-red-600">localhost:5000</span>
        </div>
      </div>
    </div>
  );
}
