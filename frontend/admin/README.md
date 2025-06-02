# MAEK Protocol - Fund Administrator Dashboard

A comprehensive React-based dashboard for managing the MAEK Protocol fund operations, built specifically for fund administrators to monitor, manage, and update the decentralized fixed income fund.

## Features

### 📊 Dashboard Overview
- **Real-time Fund Metrics**: Total assets, NAV per share, depositor count
- **Performance Tracking**: Current yield, liquidity ratios, risk indicators
- **Live Updates**: Automatic refresh of fund state from blockchain
- **Quick Actions**: One-click access to common administrative tasks

### 💰 NAV Management
- **Daily NAV Updates**: Update Net Asset Value based on asset valuations
- **Asset Valuation Input**: Support for multiple fixed income assets
- **P&L Tracking**: Record daily profit/loss for accurate NAV calculation
- **Safety Checks**: Built-in validation to prevent erroneous NAV updates
- **Preview Calculations**: See NAV impact before confirming updates

### 👥 User Management
- **Complete User Oversight**: View all fund participants and their positions
- **Advanced Filtering**: Search and filter users by various criteria
- **Performance Analytics**: Track individual user returns and activity
- **Transaction History**: Monitor deposits, withdrawals, and yield distributions
- **Export Capabilities**: Generate reports for compliance and analysis

### 🔐 Security & Access Control
- **Wallet-based Authentication**: Secure admin access via Solana wallets
- **Admin Verification**: Automatic verification of administrative privileges
- **Read-only Mode**: Safe access for non-admin users
- **Real-time Validation**: Continuous verification of user permissions

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Blockchain Integration**: Solana Web3.js + Anchor Framework
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS with custom components
- **Wallet Integration**: Solana Wallet Adapter
- **Form Management**: React Hook Form with Zod validation
- **Charts & Visualization**: Recharts for financial data
- **Notifications**: React Hot Toast for user feedback

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Solana CLI** tools
4. **Local Solana Validator** (for development)
5. **Phantom** or **Solflare** wallet (for testing)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the admin frontend directory
cd admin-frontend

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Network Configuration
REACT_APP_SOLANA_NETWORK=localnet
REACT_APP_RPC_URL=http://localhost:8899
REACT_APP_WS_URL=ws://localhost:8900

# Program Configuration
REACT_APP_PROGRAM_ID=2gtiJ4B3Fv6oF6ZEYJcXdoNTGVC4jG5bNQjXs9ELWrhx

# Development Settings
REACT_APP_DEV_MODE=true
REACT_APP_LOG_LEVEL=debug
```

### 3. Start Local Solana Validator

Ensure your local Solana validator is running with the MAEK protocol deployed:

```bash
# Start the validator (in your main project directory)
export COPYFILE_DISABLE=1
rm -rf test-ledger .solana-ledger
solana-test-validator --reset --quiet

# The validator should be accessible at http://localhost:8899
```

### 4. Start the Development Server

```bash
npm start
# Or
yarn start
```

The dashboard will be available at `http://localhost:3000`

## Configuration

### Network Settings

The app is configured to work with your local Solana network by default. To switch networks:

```typescript
// In src/App.tsx
const endpoint = useMemo(() => {
  // Local development
  return 'http://localhost:8899';
  
  // For devnet
  // return clusterApiUrl(WalletAdapterNetwork.Devnet);
  
  // For mainnet
  // return clusterApiUrl(WalletAdapterNetwork.Mainnet);
}, []);
```

### Program ID Configuration

Update the program ID in `src/types/index.ts`:

```typescript
export const PROGRAM_CONFIG = {
  PROGRAM_ID: '2gtiJ4B3Fv6oF6ZEYJcXdoNTGVC4jG5bNQjXs9ELWrhx', // Your deployed program ID
  NETWORK: 'localnet',
  RPC_URL: 'http://localhost:8899',
} as const;
```

## Usage Guide

### 1. Wallet Connection

1. Click "Select Wallet" in the header
2. Choose your preferred wallet (Phantom, Solflare, etc.)
3. Approve the connection request
4. The dashboard will verify your admin permissions

### 2. Daily NAV Updates

1. Navigate to "NAV Update" in the sidebar
2. Add asset valuations for all fund holdings
3. Enter the net daily P&L
4. Review the NAV calculation preview
5. Submit the update (requires admin privileges)

### 3. User Management

1. Go to "User Management" section
2. View all fund participants and their statistics
3. Use search and filters to find specific users
4. Click on users to view detailed information
5. Export data for reporting purposes

### 4. Dashboard Monitoring

1. The main dashboard provides real-time fund overview
2. Key metrics update automatically every 30 seconds
3. Risk indicators show current fund health
4. Quick actions provide fast access to common tasks

## Development

### Project Structure

```
admin-frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   ├── nav/            # NAV management components
│   │   └── users/          # User management components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main application component
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### Adding New Features

1. **Components**: Add new components in appropriate directories
2. **Hooks**: Create custom hooks in `src/hooks/`
3. **Types**: Define interfaces in `src/types/index.ts`
4. **Utilities**: Add helper functions in `src/utils/`

### Available Scripts

```bash
# Development
npm start                   # Start development server
npm run build              # Build for production
npm test                   # Run tests
npm run eject              # Eject from Create React App

# Linting & Formatting
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Environment Variables

Update environment variables for production:

```env
REACT_APP_SOLANA_NETWORK=mainnet-beta
REACT_APP_RPC_URL=https://api.mainnet-beta.solana.com
REACT_APP_PROGRAM_ID=<your-mainnet-program-id>
```

### 3. Deploy

Deploy the `build/` directory to your hosting provider:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `build/` folder
- **AWS S3**: Upload to S3 bucket with static hosting
- **IPFS**: Use fleek.co or similar for decentralized hosting

## Security Considerations

### 1. Admin Access Control
- Only wallets with admin authority can perform sensitive operations
- All admin actions are verified on-chain
- Read-only access is provided for non-admin users

### 2. Transaction Security
- All transactions require wallet signature approval
- Built-in validation prevents invalid operations
- Safety checks for large NAV changes

### 3. Data Privacy
- No sensitive data is stored locally
- All data comes directly from the blockchain
- Wallet private keys never leave the user's device

## Troubleshooting

### Common Issues

1. **Wallet Not Connecting**
   - Ensure your wallet extension is installed and unlocked
   - Check that you're on the correct network
   - Try refreshing the page

2. **Fund Data Not Loading**
   - Verify the local Solana validator is running
   - Check that the program is deployed correctly
   - Confirm the program ID matches your deployment

3. **Admin Functions Disabled**
   - Ensure your connected wallet is the fund administrator
   - Check the admin authority in the fund state
   - Verify you're connected to the correct network

4. **NAV Update Failing**
   - Check that all asset valuations are valid
   - Ensure the P&L amount is reasonable
   - Verify you have sufficient SOL for transaction fees

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure the local validator and program are running
4. Test with a different wallet if issues persist

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Submit a pull request

## License

This project is part of the MAEK Protocol and follows the same licensing terms.

## Support

For technical support or questions about the admin dashboard, please refer to the main MAEK Protocol documentation or create an issue in the repository. 