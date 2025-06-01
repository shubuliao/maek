# MAEK

> An open-source, decentralized alternative to BlackRock's BUIDL fund built on Solana

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Built%20on-Solana-black)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)

## 🌟 Vision

**Democratizing access to institutional-grade fixed income investments through decentralized finance.**

MAEK enables anyone, regardless of geographic location or financial status, to access high-quality fixed income investment opportunities traditionally reserved for institutional investors. Built on Solana, our protocol offers transparency, permissionless access, and competitive yields from U.S. Treasury bill investments.

## 🎯 Key Features

- **🔓 Permissionless Access**: No minimum investment requirements or geographic restrictions
- **💰 Competitive Yields**: Target 4-5% APY from U.S. Treasury bill investments
- **⚡ Low Fees**: Solana's low transaction costs make small investments economical
- **🔍 Full Transparency**: All holdings and performance data available on-chain
- **🏛️ Institutional Grade**: Professional fund management with retail accessibility
- **🗳️ Decentralized Governance**: Community-controlled protocol parameters

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Investor UI   │    Admin UI     │       Mobile App            │
│   (React/TS)    │   (React/TS)    │    (React Native)          │
└─────────────────┴─────────────────┴─────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   REST API      │   GraphQL       │      WebSocket              │
└─────────────────┴─────────────────┴─────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                   Smart Contracts                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ Fund Manager    │   Governance    │    Token Vault              │
│ (Rust/Anchor)   │ (Rust/Anchor)   │  (Rust/Anchor)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    Solana Network                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Documentation

Our comprehensive documentation is located in the `/mos` directory:

- **[Design Guidelines](./mos/design-guidelines.md)** - Design principles and standards
- **[Product Strategy](./mos/product-strategy.md)** - Vision, mission, and strategic roadmap
- **[Product Requirements](./mos/product-requirements.md)** - Detailed feature specifications
- **[Architecture Design](./mos/architecture-design.md)** - Technical architecture and decisions

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://rustup.rs/) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/maek.git
   cd maek
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies for frontend
   npm install
   
   # Install Rust dependencies for smart contracts
   cd programs/buidl-protocol
   cargo build
   cd ../..
   ```

3. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Configure your environment variables
   # Edit .env file with your settings
   ```

4. **Start local development**
   ```bash
   # Start local Solana validator
   solana-test-validator
   
   # Deploy smart contracts (in another terminal)
   anchor build
   anchor deploy
   
   # Start frontend development server
   npm run dev:investor  # For investor interface
   npm run dev:admin     # For admin interface
   ```

## 📁 Project Structure

```
maek/
├── docs/                    # Additional documentation
├── frontend/                # Frontend applications
│   ├── investor/           # Investor interface (React/TypeScript)
│   └── admin/              # Admin interface (React/TypeScript)
├── mos/                    # Master documentation
│   ├── design-guidelines.md
│   ├── product-strategy.md
│   ├── product-requirements.md
│   └── architecture-design.md
├── programs/               # Solana smart contracts
│   └── buidl-protocol/     # Main protocol contracts (Rust/Anchor)
│       └── src/
├── tests/                  # Test suites
├── package.json           # Node.js dependencies
├── Anchor.toml            # Anchor configuration
└── README.md              # This file
```

## 🛠️ Development

### Smart Contracts

Our smart contracts are built using the Anchor framework for Solana:

```bash
# Build contracts
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Frontend Development

The frontend is built with React and TypeScript:

```bash
# Investor interface
cd frontend/investor
npm install
npm run dev

# Admin interface
cd frontend/admin
npm install
npm run dev
```

### Running Tests

```bash
# Smart contract tests
anchor test

# Frontend tests
npm run test

# Integration tests
npm run test:integration
```

## 🔐 Security

Security is our top priority. Our approach includes:

- **Multiple Audits**: Independent security audits before mainnet deployment
- **Formal Verification**: Mathematical proofs of critical contract properties
- **Bug Bounty Program**: Ongoing security research incentives
- **Multi-sig Controls**: All administrative functions require multiple signatures

### Reporting Security Issues

Please report security vulnerabilities to [security@maek.finance](mailto:security@maek.finance). Do not disclose security issues publicly until they have been addressed.

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Areas We Need Help

- **Smart Contract Development**: Rust/Anchor expertise
- **Frontend Development**: React/TypeScript developers
- **Security Auditing**: Smart contract security experts
- **Documentation**: Technical writers and documentation experts
- **Testing**: QA engineers and test automation
- **Design**: UI/UX designers for better user experience

## 📊 Roadmap

### Phase 1: Foundation (Months 1-6)
- [ ] Smart contract development and audit
- [ ] MVP frontend interfaces
- [ ] Treasury bill integration
- [ ] Devnet deployment and testing

### Phase 2: Market Entry (Months 7-12)
- [ ] Mainnet deployment
- [ ] Governance token launch
- [ ] Community building
- [ ] Regulatory compliance

### Phase 3: Scale & Expansion (Months 13-24)
- [ ] Multi-asset support
- [ ] Cross-chain integration
- [ ] Institutional features
- [ ] Advanced DeFi composability

### Phase 4: Ecosystem Leadership (Year 2+)
- [ ] Industry standard protocols
- [ ] Global expansion
- [ ] Advanced financial instruments
- [ ] Regulatory framework leadership

## 📈 Success Metrics

| Metric | 6 Months | 1 Year | 2 Years |
|--------|----------|--------|---------|
| Total Value Locked | $10M | $100M | $1B |
| Unique Users | 1,000 | 10,000 | 100,000 |
| Annual Yield | 4-5% | 4-5% | 5-6% |
| Security Incidents | 0 | 0 | 0 |

## 🌍 Community

Join our growing community:

- **Discord**: [MAEK Community](https://discord.gg/maek)
- **Twitter**: [@MAEK_Finance](https://twitter.com/maek_finance)
- **Telegram**: [MAEK Protocol](https://t.me/maekprotocol)
- **Forum**: [community.maek.finance](https://community.maek.finance)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## ⚖️ Legal Disclaimer

This protocol is experimental software. Use at your own risk. The protocol has not been audited by a third party. The protocol is not intended for use by US persons or persons in jurisdictions where such use would be prohibited by applicable law.

This protocol is not an investment advisory service and does not provide investment advice. Users should consult with qualified financial advisors before making investment decisions.

## 🙏 Acknowledgments

- **BlackRock**: For pioneering institutional fixed income access that inspired this open alternative
- **Solana Foundation**: For building the high-performance blockchain that makes this possible
- **Anchor Framework**: For providing excellent developer tools for Solana
- **The DeFi Community**: For pushing the boundaries of decentralized finance

## 📞 Contact

- **Email**: [team@maek.finance](mailto:team@maek.finance)
- **Website**: [https://maek.finance](https://maek.finance)

---

**Built with ❤️ by the MAEK community** 