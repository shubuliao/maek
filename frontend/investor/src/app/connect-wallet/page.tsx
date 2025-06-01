'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectWallet() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Simulating wallet connection
      // In a real app, you would connect to MetaMask, WalletConnect, etc.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, just redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600">
            Connect your digital wallet to access your account and start investing.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Supported Wallets</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-3 text-center hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">MetaMask</p>
              </div>
              <div className="border border-gray-200 rounded-md p-3 text-center hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">WalletConnect</p>
              </div>
              <div className="border border-gray-200 rounded-md p-3 text-center hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Coinbase</p>
              </div>
              <div className="border border-gray-200 rounded-md p-3 text-center hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Trust Wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 