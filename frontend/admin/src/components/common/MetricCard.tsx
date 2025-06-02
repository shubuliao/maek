import React from 'react';
import { MetricCardProps } from '../../types';
import clsx from 'clsx';

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  loading = false,
  icon: Icon,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <Icon className="h-5 w-5 text-gray-400" />
        )}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <span
            className={clsx(
              'text-sm font-medium',
              {
                'text-success-600': changeType === 'positive',
                'text-danger-600': changeType === 'negative',
                'text-gray-500': changeType === 'neutral',
              }
            )}
          >
            {change}
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default MetricCard; 