'use client';

import { useState } from 'react';

export default function Account() {
  // Mock user data
  const [user, setUser] = useState({
    walletAddress: '0x1a2b3c4d5e6f7g8h9i0j...',
    joinedDate: '2024-07-10',
    totalInvested: 1000,
    totalReturns: 250.75,
    notificationPreferences: {
      investmentUpdates: true,
      marketNews: false,
      accountActivity: true
    }
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle notification preferences
  const toggleNotification = (key: keyof typeof user.notificationPreferences) => {
    setUser({
      ...user,
      notificationPreferences: {
        ...user.notificationPreferences,
        [key]: !user.notificationPreferences[key]
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Wallet Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Wallet Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Connected Wallet</div>
                <div className="font-medium text-gray-900">{user.walletAddress}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Joined Date</div>
                <div className="font-medium text-gray-900">{formatDate(user.joinedDate)}</div>
              </div>
            </div>
            <div className="mt-6 flex">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Invested</div>
                <div className="font-medium text-gray-900">${user.totalInvested.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Returns</div>
                <div className="font-medium text-green-600">+${user.totalReturns.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Investment Updates</div>
                  <div className="text-sm text-gray-500">Receive updates about your investments</div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => toggleNotification('investmentUpdates')}
                    className={`${
                      user.notificationPreferences.investmentUpdates ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none`}
                  >
                    <span
                      className={`${
                        user.notificationPreferences.investmentUpdates ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Market News</div>
                  <div className="text-sm text-gray-500">Receive news about market trends</div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => toggleNotification('marketNews')}
                    className={`${
                      user.notificationPreferences.marketNews ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none`}
                  >
                    <span
                      className={`${
                        user.notificationPreferences.marketNews ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Account Activity</div>
                  <div className="text-sm text-gray-500">Receive notifications about account activity</div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => toggleNotification('accountActivity')}
                    className={`${
                      user.notificationPreferences.accountActivity ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none`}
                  >
                    <span
                      className={`${
                        user.notificationPreferences.accountActivity ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 