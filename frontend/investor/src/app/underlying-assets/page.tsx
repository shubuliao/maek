'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Loan {
  id: number;
  loanAmount: number;
  loanDuration: number; // in months
  loanRate: number; // percentage
  merchantName: string;
  merchantIndustry: string;
  creditScore: 'A' | 'B' | 'C' | 'D' | 'E';
}

type SortField = 'merchantName' | 'loanAmount' | 'userOwnership' | 'loanRate';
type SortDirection = 'asc' | 'desc';

export default function UnderlyingAssets() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [filterMerchants, setFilterMerchants] = useState<string[]>([]);
  const [filterIndustries, setFilterIndustries] = useState<string[]>([]);
  const [filterCreditScores, setFilterCreditScores] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('merchantName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Dropdown states
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [creditScoreDropdownOpen, setCreditScoreDropdownOpen] = useState(false);

  // User owns 1% of JJT tokens, so 1% of each loan
  const userOwnershipPercentage = 0.01;

  // Mock loan data
  const loans: Loan[] = [
    {
      id: 1,
      loanAmount: 50000,
      loanDuration: 12,
      loanRate: 8.5,
      merchantName: "Joe's Coffee Shop",
      merchantIndustry: "Food & Beverage",
      creditScore: 'A'
    },
    {
      id: 2,
      loanAmount: 75000,
      loanDuration: 18,
      loanRate: 9.2,
      merchantName: "TechStart Solutions",
      merchantIndustry: "Technology",
      creditScore: 'B'
    },
    {
      id: 3,
      loanAmount: 120000,
      loanDuration: 24,
      loanRate: 7.8,
      merchantName: "Green Valley Farm",
      merchantIndustry: "Agriculture",
      creditScore: 'A'
    },
    {
      id: 4,
      loanAmount: 35000,
      loanDuration: 9,
      loanRate: 10.5,
      merchantName: "Urban Fitness Center",
      merchantIndustry: "Health & Fitness",
      creditScore: 'C'
    },
    {
      id: 5,
      loanAmount: 85000,
      loanDuration: 15,
      loanRate: 8.9,
      merchantName: "Creative Design Studio",
      merchantIndustry: "Creative Services",
      creditScore: 'B'
    },
    {
      id: 6,
      loanAmount: 200000,
      loanDuration: 36,
      loanRate: 9.8,
      merchantName: "Metro Construction",
      merchantIndustry: "Construction",
      creditScore: 'B'
    },
    {
      id: 7,
      loanAmount: 45000,
      loanDuration: 12,
      loanRate: 11.2,
      merchantName: "Fashion Forward Boutique",
      merchantIndustry: "Retail",
      creditScore: 'C'
    },
    {
      id: 8,
      loanAmount: 95000,
      loanDuration: 20,
      loanRate: 8.1,
      merchantName: "DataFlow Analytics",
      merchantIndustry: "Technology",
      creditScore: 'A'
    }
  ];

  // Get unique values for filter dropdowns
  const uniqueMerchants = Array.from(new Set(loans.map(loan => loan.merchantName))).sort();
  const uniqueIndustries = Array.from(new Set(loans.map(loan => loan.merchantIndustry))).sort();
  const creditScores = ['A', 'B', 'C', 'D', 'E'];

  // Filter loans based on current filters
  const filteredLoans = loans.filter(loan => {
    const matchesMerchant = filterMerchants.length === 0 || filterMerchants.includes(loan.merchantName);
    const matchesIndustry = filterIndustries.length === 0 || filterIndustries.includes(loan.merchantIndustry);
    const matchesCreditScore = filterCreditScores.length === 0 || filterCreditScores.includes(loan.creditScore);
    return matchesMerchant && matchesIndustry && matchesCreditScore;
  });

  const calculateUserOwnership = (loanAmount: number) => {
    return loanAmount * userOwnershipPercentage;
  };

  // Sort loans
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'merchantName':
        aValue = a.merchantName.toLowerCase();
        bValue = b.merchantName.toLowerCase();
        break;
      case 'loanAmount':
        aValue = a.loanAmount;
        bValue = b.loanAmount;
        break;
      case 'userOwnership':
        aValue = calculateUserOwnership(a.loanAmount);
        bValue = calculateUserOwnership(b.loanAmount);
        break;
      case 'loanRate':
        aValue = a.loanRate;
        bValue = b.loanRate;
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getCreditScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return '↕️';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const toggleMerchantFilter = (merchant: string) => {
    setFilterMerchants(prev => 
      prev.includes(merchant) 
        ? prev.filter(m => m !== merchant)
        : [...prev, merchant]
    );
  };

  const toggleIndustryFilter = (industry: string) => {
    setFilterIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleCreditScoreFilter = (score: string) => {
    setFilterCreditScores(prev => 
      prev.includes(score) 
        ? prev.filter(s => s !== score)
        : [...prev, score]
    );
  };

  const clearAllFilters = () => {
    setFilterMerchants([]);
    setFilterIndustries([]);
    setFilterCreditScores([]);
  };

  // Custom dropdown component
  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selectedValues, 
    onToggle, 
    isOpen, 
    setIsOpen,
    placeholder 
  }: {
    label: string;
    options: string[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    placeholder: string;
  }) => {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} ({selectedValues.length} selected)
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className="text-sm text-gray-700">
            {selectedValues.length === 0 
              ? placeholder 
              : `${selectedValues.length} selected`
            }
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map(option => (
              <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => onToggle(option)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Underlying Assets</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Underlying Assets</h1>
        <p className="text-gray-600">View all loans in the JJT fund portfolio</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Total Loans</div>
          <div className="text-2xl font-bold text-gray-900">{sortedLoans.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Total Loan Value</div>
          <div className="text-2xl font-bold text-gray-900">
            ${sortedLoans.reduce((sum, loan) => sum + loan.loanAmount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Your Ownership (1%)</div>
          <div className="text-2xl font-bold text-purple-600">
            ${sortedLoans.reduce((sum, loan) => sum + calculateUserOwnership(loan.loanAmount), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Avg. Interest Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {sortedLoans.length > 0 ? (sortedLoans.reduce((sum, loan) => sum + loan.loanRate, 0) / sortedLoans.length).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MultiSelectDropdown
            label="Merchants"
            options={uniqueMerchants}
            selectedValues={filterMerchants}
            onToggle={toggleMerchantFilter}
            isOpen={merchantDropdownOpen}
            setIsOpen={setMerchantDropdownOpen}
            placeholder="Select merchants..."
          />
          
          <MultiSelectDropdown
            label="Industries"
            options={uniqueIndustries}
            selectedValues={filterIndustries}
            onToggle={toggleIndustryFilter}
            isOpen={industryDropdownOpen}
            setIsOpen={setIndustryDropdownOpen}
            placeholder="Select industries..."
          />
          
          <MultiSelectDropdown
            label="Credit Scores"
            options={creditScores.map(score => `Grade ${score}`)}
            selectedValues={filterCreditScores.map(score => `Grade ${score}`)}
            onToggle={(value) => toggleCreditScoreFilter(value.replace('Grade ', ''))}
            isOpen={creditScoreDropdownOpen}
            setIsOpen={setCreditScoreDropdownOpen}
            placeholder="Select credit scores..."
          />
        </div>

        {(filterMerchants.length > 0 || filterIndustries.length > 0 || filterCreditScores.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="text-sm text-gray-500">Active filters:</div>
            {filterMerchants.map(merchant => (
              <span key={merchant} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {merchant}
                <button onClick={() => toggleMerchantFilter(merchant)} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
              </span>
            ))}
            {filterIndustries.map(industry => (
              <span key={industry} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {industry}
                <button onClick={() => toggleIndustryFilter(industry)} className="ml-1 text-green-600 hover:text-green-800">×</button>
              </span>
            ))}
            {filterCreditScores.map(score => (
              <span key={score} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Grade {score}
                <button onClick={() => toggleCreditScoreFilter(score)} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Sorting Controls */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-900">Sort by:</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort('merchantName')}
              className={`px-3 py-1 text-sm rounded-md border ${sortField === 'merchantName' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300'} hover:bg-blue-50`}
            >
              Merchant {getSortIcon('merchantName')}
            </button>
            <button
              onClick={() => handleSort('loanAmount')}
              className={`px-3 py-1 text-sm rounded-md border ${sortField === 'loanAmount' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300'} hover:bg-blue-50`}
            >
              Loan Amount {getSortIcon('loanAmount')}
            </button>
            <button
              onClick={() => handleSort('userOwnership')}
              className={`px-3 py-1 text-sm rounded-md border ${sortField === 'userOwnership' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300'} hover:bg-blue-50`}
            >
              Your Ownership {getSortIcon('userOwnership')}
            </button>
            <button
              onClick={() => handleSort('loanRate')}
              className={`px-3 py-1 text-sm rounded-md border ${sortField === 'loanRate' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300'} hover:bg-blue-50`}
            >
              Interest Rate {getSortIcon('loanRate')}
            </button>
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {sortedLoans.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-500">No loans match your current filters.</div>
          </div>
        ) : (
          sortedLoans.map((loan) => (
            <div key={loan.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Card Header - Always Visible */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpanded(loan.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{loan.merchantName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCreditScoreColor(loan.creditScore)}`}>
                        Grade {loan.creditScore}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Loan Amount</div>
                        <div className="text-xl font-bold text-gray-900">${loan.loanAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Your Ownership (1%)</div>
                        <div className="text-xl font-bold text-purple-600">${calculateUserOwnership(loan.loanAmount).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Interest Rate</div>
                        <div className="text-xl font-bold text-green-600">{loan.loanRate}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`transform transition-transform ${expandedCard === loan.id ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCard === loan.id && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Loan Duration</div>
                      <div className="text-lg font-medium text-gray-900">{loan.loanDuration} months</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Industry</div>
                      <div className="text-lg font-medium text-gray-900">{loan.merchantIndustry}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Credit Score</div>
                      <div className="text-lg font-medium text-gray-900">Grade {loan.creditScore}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Total Interest (Annual)</div>
                      <div className="text-lg font-medium text-green-600">
                        ${(loan.loanAmount * loan.loanRate / 100).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Your Interest Share (1%)</div>
                      <div className="text-lg font-medium text-green-600">
                        ${(calculateUserOwnership(loan.loanAmount) * loan.loanRate / 100).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Loan Status</div>
                      <div className="text-lg font-medium text-blue-600">Active</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 