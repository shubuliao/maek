import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardOverview from './components/dashboard/DashboardOverview';
import NavUpdatePanel from './components/nav/NavUpdatePanel';
import UserManagement from './components/users/UserManagement';

// Styles
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  // Configure Solana network and wallets
  const network = WalletAdapterNetwork.Devnet; // Change to Mainnet for production
  const endpoint = useMemo(() => {
    // Use local network for development
    return 'http://localhost:8899';
    // For devnet: return clusterApiUrl(network);
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Router>
              <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar />
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <Header />
                  
                  {/* Main Content Area */}
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="max-w-7xl mx-auto">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardOverview />} />
                        <Route path="/nav-update" element={<NavUpdatePanel />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/analytics" element={<div>Analytics Coming Soon</div>} />
                        <Route path="/reports" element={<div>Reports Coming Soon</div>} />
                        <Route path="/settings" element={<div>Settings Coming Soon</div>} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </Router>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      
      {/* React Query Devtools (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App; 