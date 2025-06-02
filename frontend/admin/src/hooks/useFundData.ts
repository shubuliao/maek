import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { useProgram } from './useProgram';
import { FundState, UserFundAccount, AssetValuation, DashboardMetrics } from '../types';
import { formatNumber, bnToNumber } from '../utils/formatting';

// Fund State Queries
export const useFundState = () => {
  const { program, getFundStatePDA } = useProgram();

  return useQuery(
    ['fund-state'],
    async (): Promise<FundState | null> => {
      if (!program || !getFundStatePDA) return null;
      
      const fundStatePDA = getFundStatePDA();
      if (!fundStatePDA) return null;

      try {
        const fundState = await program.account.fundState.fetch(fundStatePDA);
        return fundState as unknown as FundState;
      } catch (error) {
        console.error('Error fetching fund state:', error);
        return null;
      }
    },
    {
      staleTime: 10000, // 10 seconds
      refetchInterval: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      enabled: !!program && !!getFundStatePDA,
    }
  );
};

// Dashboard Metrics (computed from fund state)
export const useDashboardMetrics = () => {
  const { data: fundState, ...queryState } = useFundState();

  const metrics: DashboardMetrics | null = fundState ? {
    totalAssets: bnToNumber(fundState.totalAssets, 8),
    totalShares: bnToNumber(fundState.totalShares, 8),
    navPerShare: bnToNumber(fundState.navPerShare, 8),
    totalDepositors: fundState.totalDepositors,
    dailyVolume: 0, // TODO: Calculate from recent transactions
    weeklyVolume: 0, // TODO: Calculate from recent transactions
    monthlyVolume: 0, // TODO: Calculate from recent transactions
    currentYield: 4.5, // TODO: Calculate from yield history
    liquidityRatio: fundState.targetLiquidityRatio,
    lastNavUpdate: new Date(bnToNumber(fundState.lastNavUpdate, 0) * 1000),
  } : null;

  return {
    ...queryState,
    data: metrics,
  };
};

// User Accounts (for admin oversight)
export const useUserFundAccount = (userPubkey: PublicKey | null) => {
  const { program, getUserFundAccountPDA } = useProgram();

  return useQuery(
    ['user-fund-account', userPubkey?.toString()],
    async (): Promise<UserFundAccount | null> => {
      if (!program || !getUserFundAccountPDA || !userPubkey) return null;
      
      const userFundAccountPDA = getUserFundAccountPDA(userPubkey);
      if (!userFundAccountPDA) return null;

      try {
        const userAccount = await program.account.userFundAccount.fetch(userFundAccountPDA);
        return userAccount as unknown as UserFundAccount;
      } catch (error) {
        // Account doesn't exist yet
        return null;
      }
    },
    {
      staleTime: 5000, // 5 seconds
      refetchInterval: 15000, // 15 seconds
      enabled: !!program && !!getUserFundAccountPDA && !!userPubkey,
    }
  );
};

// All User Accounts (admin view)
export const useAllUserAccounts = () => {
  const { program } = useProgram();

  return useQuery(
    ['all-user-accounts'],
    async (): Promise<(UserFundAccount & { publicKey: PublicKey })[]> => {
      if (!program) return [];

      try {
        const accounts = await program.account.userFundAccount.all();
        return accounts.map(account => ({
          ...account.account as unknown as UserFundAccount,
          publicKey: account.publicKey,
        }));
      } catch (error) {
        console.error('Error fetching user accounts:', error);
        return [];
      }
    },
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // 1 minute
      enabled: !!program,
    }
  );
};

// NAV Update Mutation
export const useUpdateNav = () => {
  const { program, getFundStatePDA } = useProgram();
  const queryClient = useQueryClient();

  return useMutation(
    async ({ newAssetValuations, netDailyPnl }: {
      newAssetValuations: AssetValuation[];
      netDailyPnl: number;
    }) => {
      if (!program || !getFundStatePDA) {
        throw new Error('Program not connected');
      }

      const fundStatePDA = getFundStatePDA();
      if (!fundStatePDA) {
        throw new Error('Cannot find fund state PDA');
      }

      // Convert netDailyPnl to BN with 8 decimals
      const netDailyPnlBN = new BN(Math.floor(netDailyPnl * 100_000_000));

      const tx = await program.methods
        .updateNav(newAssetValuations, netDailyPnlBN)
        .accounts({
          admin: program.provider.publicKey!,
          fundState: fundStatePDA,
        })
        .rpc();

      return tx;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch fund state
        queryClient.invalidateQueries(['fund-state']);
        queryClient.invalidateQueries(['dashboard-metrics']);
      },
    }
  );
};

// Recent Transactions (simulated - would come from event parsing in production)
export const useRecentTransactions = () => {
  return useQuery(
    ['recent-transactions'],
    async () => {
      // TODO: Parse recent transaction events from the blockchain
      // For now, return mock data
      return [
        {
          signature: '5KJh7...xyz',
          type: 'deposit' as const,
          user: new PublicKey('11111111111111111111111111111112'),
          amount: new BN(1000_000_000), // $1000
          timestamp: new Date(Date.now() - 60000), // 1 minute ago
          status: 'confirmed' as const,
          details: { navAtTime: 1.00234567 },
        },
        {
          signature: '3Bb9k...abc',
          type: 'withdraw' as const,
          user: new PublicKey('11111111111111111111111111111113'),
          amount: new BN(500_000_000), // $500
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          status: 'confirmed' as const,
          details: { navAtTime: 1.00234567 },
        },
        {
          signature: '8Xx2m...def',
          type: 'nav_update' as const,
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'confirmed' as const,
          details: { oldNav: 1.00123456, newNav: 1.00234567 },
        },
      ];
    },
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 30000, // 30 seconds
    }
  );
};

// NAV History (simulated - would come from historical data in production)
export const useNavHistory = (timeframe: '24h' | '7d' | '30d' | '1y' = '7d') => {
  return useQuery(
    ['nav-history', timeframe],
    async () => {
      // TODO: Fetch actual NAV history from indexed data
      // For now, return mock data
      const now = Date.now();
      const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365;
      const interval = timeframe === '24h' ? 3600000 : 86400000; // 1 hour or 1 day

      return Array.from({ length: points }, (_, i) => ({
        date: new Date(now - (points - 1 - i) * interval),
        navPerShare: 1.0 + Math.sin(i * 0.1) * 0.001 + Math.random() * 0.0001,
        totalAssets: 1000000 + Math.sin(i * 0.1) * 50000 + Math.random() * 10000,
        totalShares: 1000000,
        yieldGenerated: Math.random() * 100,
      }));
    },
    {
      staleTime: 300000, // 5 minutes
    }
  );
};

// Risk Metrics (computed/simulated)
export const useRiskMetrics = () => {
  const { data: fundState } = useFundState();

  return useQuery(
    ['risk-metrics'],
    async () => {
      if (!fundState) return null;

      // Calculate risk metrics based on fund state
      const liquidityRatio = fundState.targetLiquidityRatio;
      const totalAssets = bnToNumber(fundState.totalAssets, 8);
      const cashReserves = bnToNumber(fundState.cashReserves, 6);
      
      return {
        liquidityRatio,
        concentrationRisk: 15, // TODO: Calculate from asset distribution
        creditRisk: 8, // TODO: Calculate from asset credit ratings
        durationRisk: 12, // TODO: Calculate from average duration
        withdrawalPressure: Math.min((cashReserves / totalAssets) * 100, 100),
        stressTestResults: [
          { scenario: 'Market Stress', impact: -2.5, probability: 15 },
          { scenario: 'Liquidity Crisis', impact: -5.0, probability: 5 },
          { scenario: 'Interest Rate Shock', impact: -1.8, probability: 25 },
        ],
      };
    },
    {
      staleTime: 300000, // 5 minutes
      enabled: !!fundState,
    }
  );
}; 