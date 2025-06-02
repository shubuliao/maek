import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  BellIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { formatAddress } from '../../utils/formatting';
import { useFundState } from '../../hooks/useFundData';

const Header: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { data: fundState } = useFundState();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Current page info */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Fund Administration
            </h2>
            <p className="text-sm text-gray-500">
              Manage MAEK Protocol operations and monitoring
            </p>
          </div>
        </div>

        {/* Right side - User actions and wallet */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          {connected && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {publicKey ? formatAddress(publicKey.toString()) : 'Connected'}
                </div>
                <div className="text-xs text-gray-500">
                  {fundState ? 'Admin Access' : 'Connecting...'}
                </div>
              </div>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-2">
            <WalletMultiButton 
              style={{
                backgroundColor: connected ? '#16a34a' : '#3b82f6',
                height: '40px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            />
            
            {connected && (
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Disconnect"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {!connected && (
        <div className="mt-3 bg-warning-50 border border-warning-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-warning-700">
                Please connect your wallet to access admin functions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Verification */}
      {connected && fundState && publicKey && (
        <div className="mt-3">
          {fundState.adminAuthority.equals(publicKey) ? (
            <div className="bg-success-50 border border-success-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-success-700">
                    ✓ Admin access verified. You have full administrative privileges.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-danger-700">
                    ⚠️ Warning: Connected wallet is not the fund administrator. Access is limited to read-only functions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header; 