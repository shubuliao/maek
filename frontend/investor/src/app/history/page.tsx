'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function History() {
  // Extended activity history data - same format as dashboard
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
    { 
      id: 6, 
      type: 'Receipt of Interest', 
      amount: 8.75, 
      tokens: null, 
      date: '2024-01-09', 
      time: '09:00',
      status: 'Completed'
    },
    { 
      id: 7, 
      type: 'Purchase of Token', 
      amount: 300.00, 
      tokens: 300.00, 
      date: '2024-01-08', 
      time: '13:20',
      status: 'Completed'
    },
    { 
      id: 8, 
      type: 'Rebase of Token value', 
      amount: null, 
      tokens: 22.30, 
      date: '2024-01-07', 
      time: '12:00',
      status: 'Completed'
    },
    { 
      id: 9, 
      type: 'Purchase of Token', 
      amount: 1000.00, 
      tokens: 1000.00, 
      date: '2024-01-05', 
      time: '10:15',
      status: 'Completed'
    },
    { 
      id: 10, 
      type: 'Receipt of Interest', 
      amount: 25.00, 
      tokens: null, 
      date: '2024-01-04', 
      time: '09:00',
      status: 'Completed'
    },
    { 
      id: 11, 
      type: 'Sale of Token', 
      amount: 150.00, 
      tokens: 150.00, 
      date: '2024-01-03', 
      time: '15:30',
      status: 'Completed'
    },
    { 
      id: 12, 
      type: 'Purchase of Token', 
      amount: 425.00, 
      tokens: 425.00, 
      date: '2024-01-02', 
      time: '11:45',
      status: 'Completed'
    },
    { 
      id: 13, 
      type: 'Receipt of Interest', 
      amount: 18.25, 
      tokens: null, 
      date: '2024-01-01', 
      time: '09:00',
      status: 'Completed'
    },
    { 
      id: 14, 
      type: 'Purchase of Token', 
      amount: 600.00, 
      tokens: 600.00, 
      date: '2023-12-28', 
      time: '14:20',
      status: 'Completed'
    },
    { 
      id: 15, 
      type: 'Rebase of Token value', 
      amount: null, 
      tokens: 31.45, 
      date: '2023-12-27', 
      time: '12:00',
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
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Activity History</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complete Activity History</h1>
        <p className="text-gray-600">View all your investment activities and transactions</p>
      </div>

      {/* Activity History */}
      <div className="bg-white shadow rounded-lg p-6">
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