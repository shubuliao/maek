import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  CalculatorIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'NAV Update', href: '/nav-update', icon: CalculatorIcon },
  { name: 'User Management', href: '/users', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="bg-white w-64 min-h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">MAEK</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                {
                  'bg-primary-50 text-primary-700 border-r-2 border-primary-600': isActive,
                  'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                }
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    {
                      'text-primary-600': isActive,
                      'text-gray-400 group-hover:text-gray-600': !isActive,
                    }
                  )}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="flex items-center justify-between mb-2">
            <span>Protocol Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-success-600">Active</span>
            </div>
          </div>
          <div className="text-gray-400">
            Version 1.0.0 • Local Network
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 