'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Maek</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-700">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-700">
                  Dashboard
                </Link>
                <Link href="/investments" className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-700">
                  Investments
                </Link>
                <Link href="/history" className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-700">
                  History
                </Link>
                <Link href="/account" className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-700">
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/connect-wallet" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Connect Wallet
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 