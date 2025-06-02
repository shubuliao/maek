import React from 'react';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import MetricCard from '../common/MetricCard';
import { useDashboardMetrics, useRiskMetrics } from '../../hooks/useFundData';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage, 
  formatNAV, 
  formatRelativeTime,
  formatAPY 
} from '../../utils/formatting';

const DashboardOverview: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: riskMetrics, isLoading: riskLoading } = useRiskMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fund Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time insights into MAEK Protocol fund performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets Under Management"
          value={metrics ? formatCurrency(metrics.totalAssets) : '--'}
          subtitle={`NAV: ${metrics ? formatNAV(metrics.navPerShare) : '--'}`}
          loading={metricsLoading}
          icon={CurrencyDollarIcon}
        />
        
        <MetricCard
          title="Total Fund Shares"
          value={metrics ? formatNumber(metrics.totalShares) : '--'}
          subtitle={`${metrics ? formatNumber(metrics.totalDepositors) : '--'} depositors`}
          loading={metricsLoading}
          icon={UsersIcon}
        />
        
        <MetricCard
          title="Current Yield"
          value={metrics ? formatAPY(metrics.currentYield) : '--'}
          change={"+0.05%"}
          changeType="positive"
          subtitle="30-day average"
          loading={metricsLoading}
          icon={ArrowTrendingUpIcon}
        />
        
        <MetricCard
          title="Liquidity Ratio"
          value={metrics ? formatPercentage(metrics.liquidityRatio) : '--'}
          change={riskMetrics?.liquidityRatio && riskMetrics.liquidityRatio > 20 ? "Healthy" : "Low"}
          changeType={riskMetrics?.liquidityRatio && riskMetrics.liquidityRatio > 20 ? "positive" : "negative"}
          subtitle="Cash reserves"
          loading={metricsLoading || riskLoading}
          icon={ShieldCheckIcon}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Volume Today</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deposits</span>
              <span className="text-sm font-medium text-success-600">
                {metrics ? formatCurrency(metrics.dailyVolume * 0.7) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Withdrawals</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics ? formatCurrency(metrics.dailyVolume * 0.3) : '--'}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Net Flow</span>
                <span className="text-sm font-bold text-success-600">
                  +{metrics ? formatCurrency(metrics.dailyVolume * 0.4) : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Indicators</h3>
            <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
          </div>
          {riskLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Credit Risk</span>
                <span className={`text-sm font-medium ${
                  riskMetrics && riskMetrics.creditRisk < 10 ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {riskMetrics ? `${riskMetrics.creditRisk}%` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration Risk</span>
                <span className={`text-sm font-medium ${
                  riskMetrics && riskMetrics.durationRisk < 15 ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {riskMetrics ? `${riskMetrics.durationRisk}%` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Concentration</span>
                <span className={`text-sm font-medium ${
                  riskMetrics && riskMetrics.concentrationRisk < 20 ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {riskMetrics ? `${riskMetrics.concentrationRisk}%` : '--'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Last Update</h3>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">NAV Update</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics ? formatRelativeTime(metrics.lastNavUpdate) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fund Status</span>
              <span className="text-sm font-medium text-success-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Next NAV</span>
              <span className="text-sm font-medium text-gray-900">4:00 PM EST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary-900">Quick Actions</h3>
            <p className="text-sm text-primary-700 mt-1">
              Common administrative tasks
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Update NAV
            </button>
            <button
              className="bg-white text-primary-600 border border-primary-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              View Reports
            </button>
            <button
              className="bg-white text-primary-600 border border-primary-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              User Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 