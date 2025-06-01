'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Investments() {
  // Mock data for available and active investments
  const activeInvestments = [
    { id: 1, name: 'Tech Growth Fund', description: 'High-growth technology companies', amount: 500, currentValue: 575.25, returnPercentage: 15.05, riskLevel: 'Medium' },
    { id: 2, name: 'Sustainable Energy', description: 'Renewable energy projects', amount: 350, currentValue: 412.50, returnPercentage: 17.86, riskLevel: 'Medium' },
    { id: 3, name: 'Global Markets', description: 'Diversified global market index', amount: 150, currentValue: 163.00, returnPercentage: 8.67, riskLevel: 'Low' },
  ];
  
  const availableInvestments = [
    { id: 4, name: 'Emerging Markets', description: 'Developing economies with high growth potential', minInvestment: 100, expectedReturn: '10-15%', riskLevel: 'High' },
    { id: 5, name: 'Real Estate Fund', description: 'Commercial and residential real estate projects', minInvestment: 250, expectedReturn: '8-12%', riskLevel: 'Medium' },
    { id: 6, name: 'Crypto Index', description: 'Diversified cryptocurrency basket', minInvestment: 50, expectedReturn: '15-25%', riskLevel: 'Very High' },
  ];

  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <p className="text-gray-600">Manage your portfolio and discover new opportunities</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active Investments
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`${
              activeTab === 'opportunities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Investment Opportunities
          </button>
        </nav>
      </div>

      {/* Active Investments Tab */}
      {activeTab === 'active' && (
        <div>
          <div className="grid grid-cols-1 gap-6">
            {activeInvestments.map((investment) => (
              <div key={investment.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{investment.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{investment.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500">Amount Invested</div>
                          <div className="font-medium">${investment.amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Current Value</div>
                          <div className="font-medium">${investment.currentValue.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Return</div>
                          <div className="font-medium text-green-600">+{investment.returnPercentage.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Risk Level</div>
                          <div className="font-medium">{investment.riskLevel}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link 
                      href={`/investments/${investment.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div>
          <div className="grid grid-cols-1 gap-6">
            {availableInvestments.map((investment) => (
              <div key={investment.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{investment.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{investment.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Minimum Investment</div>
                        <div className="font-medium">${investment.minInvestment}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Expected Return</div>
                        <div className="font-medium">{investment.expectedReturn}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Risk Level</div>
                        <div className="font-medium">{investment.riskLevel}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link 
                      href={`/investments/opportunity/${investment.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/investments/subscribe/${investment.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Subscribe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 