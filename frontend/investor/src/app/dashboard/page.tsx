'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  // Main balance values
  const [cashBalance, setCashBalance] = useState(2500.00); // USDC
  const [underlyingAssets, setUnderlyingAssets] = useState(1320.50); // Value of underlying assets
  const [tokenBalance, setTokenBalance] = useState(underlyingAssets); // JJT tokens - pegged 1:1 with underlying assets
  const [tokenCount, setTokenCount] = useState(underlyingAssets); // Number of JJT tokens (1 token = $1)
  
  // Mock data for activity history
  const activityHistory = [
    { 
      id: 1, 
      type: 'Purchase of Token', 
      amount: 500.00, 
      tokens: 500.00, 
      date: '2024-01-15', 
      time: '14:30',
      status: 'Completed'
    },
    { 
      id: 2, 
      type: 'Receipt of Interest', 
      amount: 12.50, 
      tokens: null, 
      date: '2024-01-14', 
      time: '09:00',
      status: 'Completed'
    },
    { 
      id: 3, 
      type: 'Rebase of Token value', 
      amount: null, 
      tokens: 15.25, 
      date: '2024-01-13', 
      time: '12:00',
      status: 'Completed'
    },
    { 
      id: 4, 
      type: 'Purchase of Token', 
      amount: 750.00, 
      tokens: 750.00, 
      date: '2024-01-12', 
      time: '16:45',
      status: 'Completed'
    },
    { 
      id: 5, 
      type: 'Sale of Token', 
      amount: 200.00, 
      tokens: 200.00, 
      date: '2024-01-10', 
      time: '11:20',
      status: 'Completed'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Purchase of Token':
        return '↗️';
      case 'Sale of Token':
        return '↙️';
      case 'Receipt of Interest':
        return '💰';
      case 'Rebase of Token value':
        return '🔄';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Purchase of Token':
        return 'text-blue-600';
      case 'Sale of Token':
        return 'text-red-600';
      case 'Receipt of Interest':
        return 'text-green-600';
      case 'Rebase of Token value':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your balances and recent activity</p>
      </div>

      {/* Quick Actions and Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Buy JJT
            </button>
            <button className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
              Sell JJT
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Wallet</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Connected Wallet</div>
                <div className="font-medium text-gray-900">0x1a2b...3c4d</div>
              </div>
              <button className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                Disconnect
              </button>
            </div>
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              Transfer USDC
            </button>
          </div>
        </div>
      </div>

      {/* Main Balance Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Your Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 mb-2 font-medium">Cash Balance</div>
                <div className="text-3xl font-bold text-blue-900">${cashBalance.toFixed(2)}</div>
                <div className="text-sm text-blue-700 mt-1">USDC</div>
              </div>
              <div className="text-3xl">💵</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 mb-2 font-medium">Token Balance</div>
                <div className="text-3xl font-bold text-green-900">${tokenBalance.toFixed(2)}</div>
                <div className="text-sm text-green-700 mt-1">JJT ({tokenCount.toFixed(2)} tokens)</div>
              </div>
              <div className="text-3xl">🪙</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 mb-2 font-medium">Underlying Assets</div>
                <div className="text-3xl font-bold text-purple-900">${underlyingAssets.toFixed(2)}</div>
                <div className="text-sm text-purple-700 mt-1">Asset Value</div>
                <Link href="/underlying-assets" className="text-xs text-purple-600 hover:text-purple-500 mt-2 inline-block">
                  View Assets →
                </Link>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Activity History</h2>
          <Link href="/history" className="text-sm text-blue-600 hover:text-blue-500">
            View All Activity
          </Link>
        </div>
        
        <div className="space-y-4">
          {activityHistory.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div>
                  <div className={`font-medium ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.date} at {activity.time}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {activity.amount && (
                  <div className="font-medium text-gray-900">
                    ${activity.amount.toFixed(2)}
                  </div>
                )}
                {activity.tokens && (
                  <div className="text-sm text-gray-600">
                    {activity.tokens.toFixed(2)} JJT
                  </div>
                )}
                <div className="text-xs text-green-600 font-medium mt-1">
                  {activity.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 