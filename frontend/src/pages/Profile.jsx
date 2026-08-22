import React from 'react';
import { User, Settings, Shield } from 'lucide-react';

export default function Profile() {
  const user = {
    name: 'Zara Shukla',
    email: 'zara.shukla@example.com',
    joined: 'August 2026',
    preferences: {
      currency: 'INR (₹)',
      language: 'English',
      notifications: true
    }
  };

  return (
    <div className="w-full py-2">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
            <User className="h-12 w-12" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
          <span className="text-sm text-gray-500">{user.email}</span>
          <span className="text-xs text-gray-400 mt-2">Member since {user.joined}</span>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-500" /> Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">Preferred Currency</span>
              <span className="font-semibold text-gray-900">{user.preferences.currency}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">Language</span>
              <span className="font-semibold text-gray-900">{user.preferences.language}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">Email Notifications</span>
              <span className="font-semibold text-primary-600">{user.preferences.notifications ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mt-8 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-500" /> Security
          </h3>
          <div>
            <button className="text-sm text-red-600 hover:text-red-700 font-semibold">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
