# MAEK Project Folder Structure

This document provides a comprehensive overview of the MAEK project's folder structure and organization. MAEK is an open-source alternative to BlackRock's BUIDL fund, built on Solana.

## 📁 Root Directory Structure

```
maek/
├── docs/                          # General project documentation
├── frontend/                      # Web application interfaces
│   ├── fund_admin/               # Administrative dashboard
│   └── investor/                 # Investor portal
├── mos/                          # Modular Organization System (Engineering Docs)
│   └── modules/                  # Individual feature modules
│       └── 001-core-fund-management/  # Core fund operations
├── programs/                     # Solana smart contracts
│   └── maek-protocol/          # Main protocol implementation
│       └── src/                 # Rust source code
├── tests/                       # Test suites and test utilities
├── .gitignore                   # Git ignore rules
├── .prettierrc                  # Code formatting configuration
├── Anchor.toml                  # Anchor framework configuration
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # Project license
├── package.json                 # Node.js dependencies and scripts
├── README.md                    # Project overview and setup
└── tsconfig.json               # TypeScript configuration
```

## 📖 Directory Explanations

### `/docs` - General Documentation
Contains high-level project documentation, user guides, and general reference materials.

**Purpose**: Public-facing documentation for users, integrators, and general contributors.

**Typical Contents**:
- User guides and tutorials
- API documentation
- Integration guides
- Deployment instructions
- Architecture overviews

### `/frontend` - Web Applications

#### `/frontend/fund_admin` - Administrative Dashboard
Web interface for fund administrators and operators.

**Purpose**: Provides administrative controls for fund management operations.

**Key Features**:
- Fund configuration and settings
- Asset management and rebalancing
- NAV updates and reporting
- User account management
- Treasury operations monitoring
- Analytics and performance dashboards

#### `/frontend/investor` - Investor Portal
Web interface for fund investors and end users.

**Purpose**: Enables investors to interact with the fund and manage their investments.

**Key Features**:
- Account creation and KYC
- Deposit and withdrawal interfaces
- Portfolio tracking and analytics
- Yield distribution management
- Transaction history
- Real-time NAV display

### `/mos` - Modular Organization System
Engineering documentation organized by functional modules.

**Purpose**: Provides detailed technical specifications for developers implementing specific features.

**Structure Philosophy**:
- Each module represents a cohesive set of functionality
- Contains complete engineering specifications
- Includes implementation plans and work unit breakdowns
- Facilitates parallel development by different teams

#### `/mos/modules/001-core-fund-management`
Complete specifications for the core fund management system.

**Contents**:
- `product-strategy.md` - Business strategy and competitive analysis
- `product-requirements.md` - Detailed functional requirements
- `technical-design.md` - Complete technical specifications
- `implementation-plan.md` - Step-by-step development plan

**Key Features Covered**:
- Deposit and withdrawal mechanisms
- NAV calculation and updates
- Yield distribution (via NAV rebase)
- Treasury asset management
- User account management
- Security and access controls

### `/programs` - Solana Smart Contracts

#### `/programs/maek-protocol` - Main Protocol Implementation
Contains the core Solana program implementing the fund management logic.

**Purpose**: On-chain smart contracts that handle all fund operations, mimicking BlackRock BUIDL's mechanisms.

#### `/programs/maek-protocol/src` - Rust Source Code
Current implemented structure:

```
src/
├── lib.rs                    # Main program entry point with instruction declarations
├── error.rs                  # Custom error definitions and messages
├── events.rs                 # Event definitions for comprehensive logging
├── instructions/             # Instruction handlers
│   ├── mod.rs               # Module exports
│   ├── initialize_fund.rs   # Fund initialization (planned)
│   ├── deposit.rs           # Deposit handling (planned)
│   ├── withdraw.rs          # Withdrawal handling (planned)
│   ├── update_nav.rs        # NAV updates with P&L (planned)
│   ├── invest_fixed_income.rs # Fixed income investment (planned)
│   ├── handle_maturity.rs   # Asset maturity handling (planned)
│   └── admin.rs             # Administrative functions (planned)
├── state/                   # Account structures
│   ├── mod.rs               # Module exports
│   ├── fund_state.rs        # Main fund state account
│   ├── user_account.rs      # User fund accounts
│   └── fixed_income_asset.rs # Fixed income asset records
└── utils/                   # Utility functions
    ├── mod.rs               # Module exports
    ├── calculations.rs      # NAV and yield calculations
    └── validation.rs        # Input validation helpers
```

**Core Functionality**:
- Fund initialization and configuration
- User deposit processing with token minting
- User withdrawal processing with token burning
- Daily NAV updates with profit/loss rebase mechanism
- Fixed income asset management
- Liquidity management and monitoring

### `/tests` - Test Suites
Contains all testing code and utilities for the project.

**Purpose**: Ensures code quality, functionality, and security through comprehensive testing.

**Expected Contents**:
- Unit tests for individual functions and modules
- Integration tests for end-to-end workflows
- Load testing for performance validation
- Security tests for vulnerability assessment
- Mock data and test utilities
- Automated test runners and CI/CD configurations

## 🔧 Configuration Files

### `Anchor.toml`
Anchor framework configuration for Solana program development.

**Contains**:
- Program declarations and addresses
- Network configurations (devnet, testnet, mainnet)
- Build and deployment settings
- Dependencies and feature flags

### `package.json`
Node.js project configuration for frontend and tooling.

**Contains**:
- JavaScript/TypeScript dependencies
- Build scripts and development commands
- Testing frameworks and utilities
- Code formatting and linting tools

### `tsconfig.json`
TypeScript compiler configuration for frontend applications.

**Contains**:
- TypeScript compilation settings
- Module resolution configurations
- Type checking options
- Output directory settings

## 🚀 Development Workflow

### For Smart Contract Development
1. Navigate to `/programs/maek-protocol/src`
2. Reference `/mos/modules/001-core-fund-management/technical-design.md`
3. Implement Rust instructions and state structures
4. Run tests from `/tests` directory
5. Deploy using Anchor CLI commands

### For Frontend Development
1. Choose appropriate frontend directory (`fund_admin` or `investor`)
2. Reference API specifications in `/mos` modules
3. Implement UI components and integration logic
4. Test against local or devnet deployments

### For Documentation Updates
1. Module-specific engineering docs go in `/mos/modules/`
2. General project docs go in `/docs/`
3. Follow the modular organization system for new features

## 📋 Module Expansion Guidelines

When adding new modules to `/mos/modules/`, follow this naming convention:
- `XXX-module-name/` where XXX is a 3-digit number
- Include these core documents:
  - `product-strategy.md` - Business context and requirements
  - `product-requirements.md` - Detailed functional specifications
  - `technical-design.md` - Complete implementation specifications
  - `implementation-plan.md` - Work units and timeline

**Upcoming Modules** (based on roadmap):
- `002-oracle-integration/` - Price feeds and external data
- `003-compliance-framework/` - KYC/AML and regulatory features
- `004-governance-system/` - DAO governance and voting
- `005-portfolio-analytics/` - Advanced reporting and analytics
- `006-institutional-api/` - Enterprise integration interfaces

## 🔐 Security Considerations

### Sensitive Files and Directories
- Keep private keys and secrets out of version control
- Use environment variables for configuration
- Secure admin access to fund management functions
- Implement proper access controls in smart contracts

### Code Organization Best Practices
- Separate business logic from presentation (frontend/backend)
- Use modular design for easy testing and maintenance
- Follow Rust and TypeScript best practices for security
- Implement comprehensive error handling and validation

This folder structure is designed to support a modular, scalable development approach while maintaining clear separation of concerns between different aspects of the MAEK protocol. 