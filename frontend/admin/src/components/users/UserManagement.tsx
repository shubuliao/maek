import React, { useState, useMemo } from 'react';
import BN from 'bn.js';
import { 
  UserIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAllUserAccounts } from '../../hooks/useFundData';
import { 
  formatCurrency, 
  formatFundTokens, 
  formatAddress, 
  formatRelativeTime,
  formatPercentage,
  bnToNumber 
} from '../../utils/formatting';
import { SortConfig, FilterConfig } from '../../types';

const UserManagement: React.FC = () => {
  const { data: userAccounts, isLoading } = useAllUserAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'totalDeposited', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Process and filter user data
  const processedUsers = useMemo(() => {
    if (!userAccounts) return [];

    return userAccounts.map(account => ({
      address: account.publicKey.toString(),
      owner: account.owner.toString(),
      fundTokens: bnToNumber(account.fundTokens, 8),
      totalDeposited: bnToNumber(account.totalDeposited, 8),
      totalWithdrawn: bnToNumber(account.totalWithdrawn, 8),
      netPosition: bnToNumber(account.totalDeposited, 8) - bnToNumber(account.totalWithdrawn, 8),
      totalYieldEarned: bnToNumber(account.totalYieldEarned, 8),
      depositCount: account.depositCount,
      withdrawalCount: account.withdrawalCount,
      avgCostBasis: bnToNumber(account.avgCostBasis, 8),
      lastActivity: Math.max(
        bnToNumber(account.lastDepositTime, 0),
        bnToNumber(account.lastWithdrawalTime, 0)
      ),
      createdAt: bnToNumber(account.createdAt, 0),
      autoCompound: account.autoCompound,
      pendingYield: bnToNumber(account.pendingYield, 6),
      performanceRatio: account.totalDeposited.gt(new BN(0)) 
        ? (bnToNumber(account.totalYieldEarned, 8) / bnToNumber(account.totalDeposited, 8)) * 100 
        : 0,
    }));
  }, [userAccounts]);

  // Apply filters and search
  const filteredUsers = useMemo(() => {
    let filtered = processedUsers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Amount filters
    if (filters.amountRange) {
      filtered = filtered.filter(user => 
        user.totalDeposited >= (filters.amountRange?.min || 0) &&
        user.totalDeposited <= (filters.amountRange?.max || Infinity)
      );
    }

    // Date filters
    if (filters.dateRange) {
      const startTime = filters.dateRange.start.getTime() / 1000;
      const endTime = filters.dateRange.end.getTime() / 1000;
      filtered = filtered.filter(user => 
        user.createdAt >= startTime && user.createdAt <= endTime
      );
    }

    return filtered;
  }, [processedUsers, searchTerm, filters]);

  // Apply sorting
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = filteredUsers.length;
    const totalDeposited = filteredUsers.reduce((sum, user) => sum + user.totalDeposited, 0);
    const totalWithdrawn = filteredUsers.reduce((sum, user) => sum + user.totalWithdrawn, 0);
    const avgDeposit = total > 0 ? totalDeposited / total : 0;
    const activeUsers = filteredUsers.filter(user => user.lastActivity > Date.now() / 1000 - 86400 * 30).length;

    return {
      total,
      totalDeposited,
      totalWithdrawn,
      avgDeposit,
      activeUsers,
      activePercentage: total > 0 ? (activeUsers / total) * 100 : 0,
    };
  }, [filteredUsers]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{summary.total} total users</span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              {formatPercentage(summary.activePercentage)} active (30d)
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Deposited</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalDeposited)}
            </p>
            <p className="text-sm text-gray-500">All-time deposits</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Withdrawn</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalWithdrawn)}
            </p>
            <p className="text-sm text-gray-500">All-time withdrawals</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Average Deposit</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.avgDeposit)}
            </p>
            <p className="text-sm text-gray-500">Per user</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction: direction as 'asc' | 'desc' });
              }}
            >
              <option value="totalDeposited-desc">Highest Depositors</option>
              <option value="totalDeposited-asc">Lowest Depositors</option>
              <option value="createdAt-desc">Newest Users</option>
              <option value="createdAt-asc">Oldest Users</option>
              <option value="lastActivity-desc">Recently Active</option>
              <option value="performanceRatio-desc">Best Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('owner')}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    {getSortIcon('owner')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fundTokens')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Fund Tokens</span>
                    {getSortIcon('fundTokens')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalDeposited')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Deposited</span>
                    {getSortIcon('totalDeposited')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalYieldEarned')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Yield Earned</span>
                    {getSortIcon('totalYieldEarned')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('depositCount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Transactions</span>
                    {getSortIcon('depositCount')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastActivity')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Last Activity</span>
                    {getSortIcon('lastActivity')}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr 
                  key={user.address} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(selectedUser === user.address ? null : user.address)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatAddress(user.owner)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatAddress(user.address)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatFundTokens(user.fundTokens)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(user.fundTokens * 1.0)} value
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(user.totalDeposited)}
                    </div>
                    <div className="text-sm text-gray-500">
                      -{formatCurrency(user.totalWithdrawn)} withdrawn
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(user.totalYieldEarned)}
                    </div>
                    <div className="text-sm text-success-600">
                      {formatPercentage(user.performanceRatio)} return
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.depositCount} deposits
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.withdrawalCount} withdrawals
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {formatRelativeTime(new Date(user.lastActivity * 1000))}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No users have deposited yet.'}
            </p>
          </div>
        )}
      </div>

      {/* User Detail Panel */}
      {selectedUser && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
          {/* Add detailed user information here */}
          <p className="text-sm text-gray-600">
            Detailed information for user {formatAddress(selectedUser)}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 