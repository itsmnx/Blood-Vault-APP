import React, { useState } from 'react';
import { Droplet, UserPlus } from 'lucide-react';
import * as api from '../../services/api';

export default function Register({ onRegister, onSwitchMode }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!form.userType) {
      setError('Please select a user type');
      return;
    }

    setLoading(true);

    try {
      await api.register(form.email, form.password, form.userType);
      alert('✅ Registration successful! Please login.');
      onRegister();
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <p className="text-gray-500 text-sm mt-1">Join the Life Saver Network ❤️</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            className="px-4 py-2 text-gray-500 hover:text-red-600"
            onClick={onSwitchMode}
          >
            Login
          </button>
          <button
            className="px-4 py-2 font-semibold text-red-600 border-b-2 border-red-600"
            disabled
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

        {/* Register Form */}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {/* USER TYPE DROPDOWN */}
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Note: After registration, use the same credentials to login.
        </div>

      </div>
    </div>
  );
}
