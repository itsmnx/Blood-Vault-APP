import React, { useState, useRef, useEffect } from 'react';
import { Droplet, LogOut, User, FileText, ChevronDown, X, Mail, Calendar, Shield } from 'lucide-react';

export default function Navbar({ onLogout, user, onUserUpdate }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: 'staff'
  });
  const dropdownRef = useRef(null);

  // Get user initials
  const getUserInitials = (user) => {
    if (!user) return 'U';
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    if (user.fullName) {
      const names = user.fullName.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAccountDetails = () => {
    setIsDropdownOpen(false);
    setShowAccountDetails(true);
  };

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    // Initialize form with current user data
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      userType: user?.userType || 'staff'
    });
    setShowEditProfile(true);
  };

  const handleFormChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    console.log('Saving profile:', profileForm);
    
    // Update user data in parent component
    if (onUserUpdate) {
      const updatedUser = {
        ...user,
        fullName: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        userType: profileForm.userType
      };
      onUserUpdate(updatedUser);
    }
    
    alert(`Profile updated successfully!\n\nName: ${profileForm.fullName}\nEmail: ${profileForm.email}\nPhone: ${profileForm.phone}\nRole: ${profileForm.userType}`);
    setShowEditProfile(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <nav className="bg-red-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-2">
          <Droplet className="w-6 h-6 text-white" />
          <h1 className="text-xl font-bold tracking-wide">Blood Vault</h1>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            {/* Profile Avatar with Initials */}
            <div className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {getUserInitials(user)}
            </div>
            
            {/* User Info */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">
                {user?.fullName || user?.email || 'User'}
              </p>
              {user?.userType && (
                <p className="text-xs text-red-200 capitalize">
                  {user.userType}
                </p>
              )}
            </div>
            
            {/* Dropdown Arrow */}
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info in Dropdown */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {getUserInitials(user)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.fullName || 'User Name'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.email || 'user@example.com'}
                    </p>
                    {user?.userType && (
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        Role: {user.userType}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleAccountDetails}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                >
                  <FileText size={16} className="text-gray-500" />
                  <span>Account Details</span>
                </button>
                
                <button
                  onClick={handleEditProfile}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                >
                  <User size={16} className="text-gray-500" />
                  <span>Edit Profile</span>
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                >
                  <LogOut size={16} className="text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Details Modal */}
      {showAccountDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
              <button
                onClick={() => setShowAccountDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {getUserInitials(user)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user?.fullName || 'User Name'}</h4>
                  <p className="text-sm text-gray-600 capitalize">{user?.userType || 'User'}</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Address</p>
                    <p className="text-sm text-gray-600">{user?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Shield size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">User Role</p>
                    <p className="text-sm text-gray-600 capitalize">{user?.userType || 'Standard User'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Member Since</p>
                    <p className="text-sm text-gray-600">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Account Status</p>
                    <p className="text-sm text-green-600 font-medium">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAccountDetails(false)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form id="edit-profile-form" onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-gray-900 bg-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-gray-900 bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-gray-900 bg-white"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department/Role
                </label>
                <select 
                  value={profileForm.userType}
                  onChange={(e) => handleFormChange('userType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors bg-white text-gray-900"
                >
                  <option value="admin">Administrator</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="technician">Lab Technician</option>
                  <option value="staff">Staff Member</option>
                </select>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                type="submit"
                form="edit-profile-form"
                onClick={handleSaveProfile}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
