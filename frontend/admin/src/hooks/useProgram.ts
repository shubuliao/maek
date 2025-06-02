import { useMemo } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_CONFIG } from '../types';

// IDL placeholder - in production, import the actual IDL from the deployed program
const IDL: Idl = {
  version: "0.1.0",
  name: "maek_protocol",
  instructions: [
    {
      name: "deposit",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "userFundAccount", isMut: true, isSigner: false },
        { name: "fundState", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "fundUsdcVault", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "amount", type: "u64" }
      ]
    },
    {
      name: "withdraw",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "userFundAccount", isMut: true, isSigner: false },
        { name: "fundState", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "fundUsdcVault", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "fundTokens", type: "u64" }
      ]
    },
    {
      name: "updateNav",
      accounts: [
        { name: "admin", isMut: true, isSigner: true },
        { name: "fundState", isMut: true, isSigner: false },
      ],
      args: [
        { name: "newAssetValuations", type: { vec: { defined: "AssetValuation" } } },
        { name: "netDailyPnl", type: "i64" }
      ]
    }
  ],
  accounts: [
    {
      name: "FundState",
      type: {
        kind: "struct",
        fields: [
          { name: "adminAuthority", type: "publicKey" },
          { name: "fundTokenMint", type: "publicKey" },
          { name: "usdcMint", type: "publicKey" },
          { name: "usdcVault", type: "publicKey" },
          { name: "treasuryVault", type: "publicKey" },
          { name: "totalAssets", type: "u64" },
          { name: "totalShares", type: "u64" },
          { name: "navPerShare", type: "u64" },
          { name: "lastNavUpdate", type: "i64" },
          { name: "cashReserves", type: "u64" },
          { name: "fixedIncomeValue", type: "u64" },
          { name: "managementFeeBps", type: "u16" },
          { name: "targetLiquidityRatio", type: "u8" },
          { name: "isPaused", type: "bool" },
          { name: "inceptionDate", type: "i64" },
          { name: "totalYieldDistributed", type: "u64" },
          { name: "totalDepositors", type: "u32" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "UserFundAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "fundTokens", type: "u64" },
          { name: "totalDeposited", type: "u64" },
          { name: "totalWithdrawn", type: "u64" },
          { name: "lastDepositTime", type: "i64" },
          { name: "lastWithdrawalTime", type: "i64" },
          { name: "autoCompound", type: "bool" },
          { name: "pendingYield", type: "u64" },
          { name: "totalYieldEarned", type: "u64" },
          { name: "createdAt", type: "i64" },
          { name: "depositCount", type: "u32" },
          { name: "withdrawalCount", type: "u32" },
          { name: "avgCostBasis", type: "u64" },
          { name: "lastDepositNav", type: "u64" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ],
  types: [
    {
      name: "AssetValuation",
      type: {
        kind: "struct",
        fields: [
          { name: "assetId", type: "publicKey" },
          { name: "currentValue", type: "u64" }
        ]
      }
    }
  ]
};

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    
    return new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    
    const programId = new PublicKey(PROGRAM_CONFIG.PROGRAM_ID);
    return new Program(IDL, programId, provider);
  }, [provider]);

  const programId = useMemo(() => 
    new PublicKey(PROGRAM_CONFIG.PROGRAM_ID), 
    []
  );

  // Helper function to get fund state PDA
  const getFundStatePDA = useMemo(() => {
    return () => {
      if (!program) return null;
      return PublicKey.findProgramAddressSync(
        [Buffer.from('fund_state')],
        program.programId
      )[0];
    };
  }, [program]);

  // Helper function to get user fund account PDA
  const getUserFundAccountPDA = useMemo(() => {
    return (userPubkey: PublicKey) => {
      if (!program) return null;
      return PublicKey.findProgramAddressSync(
        [Buffer.from('user_fund'), userPubkey.toBuffer()],
        program.programId
      )[0];
    };
  }, [program]);

  return {
    program,
    provider,
    programId,
    getFundStatePDA,
    getUserFundAccountPDA,
    isConnected: !!wallet.publicKey && !!program,
  };
}; 