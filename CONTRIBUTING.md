# Contributing to MAEK

Thank you for your interest in contributing to MAEK! We welcome contributions from developers, designers, documentation writers, and financial experts who share our vision of democratizing access to institutional-grade fixed income investments.

## 🎯 Ways to Contribute

### Code Contributions
- **Smart Contracts**: Rust/Anchor development for Solana
- **Frontend Development**: React/TypeScript applications
- **Backend Services**: Node.js/TypeScript microservices
- **Testing**: Unit tests, integration tests, and end-to-end testing
- **Security**: Security audits and vulnerability research

### Non-Code Contributions
- **Documentation**: Technical docs, user guides, tutorials
- **Design**: UI/UX improvements and design systems
- **Research**: Market research, regulatory analysis
- **Community**: Community management and outreach
- **Translation**: Internationalization and localization

## 🚀 Getting Started

### Prerequisites

1. **Technical Skills**:
   - For smart contracts: Rust, Solana, Anchor framework
   - For frontend: React, TypeScript, Web3 libraries
   - For backend: Node.js, TypeScript, databases
   - For DevOps: Docker, Kubernetes, CI/CD

2. **Knowledge Areas**:
   - DeFi protocols and tokenomics
   - Fixed income investments and treasury bills
   - Regulatory compliance in financial services
   - Security best practices for financial applications

### Setting Up Development Environment

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/yourusername/maek.git
   cd maek
   ```

2. **Install Dependencies**:
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Rust and Solana CLI
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
   
   # Install Anchor CLI
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Set Up Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 📋 Development Process

### 1. Issue Tracking

Before starting work:
- Check existing [issues](https://github.com/maek-finance/maek/issues)
- Create a new issue if your contribution doesn't have one
- Discuss the approach in the issue comments
- Get approval from maintainers for significant changes

### 2. Branch Naming

Use descriptive branch names:
- `feature/add-governance-voting`
- `fix/withdrawal-bug-on-mainnet`
- `docs/update-api-documentation`
- `security/fix-reentrancy-vulnerability`

### 3. Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples
feat: add governance token staking mechanism
fix: resolve withdrawal queue overflow issue
docs: update smart contract integration guide
test: add unit tests for fund manager contract
security: implement rate limiting for deposits
```

### 4. Pull Request Process

1. **Create PR**:
   - Use clear, descriptive titles
   - Fill out the PR template completely
   - Link related issues
   - Add appropriate labels

2. **Code Review**:
   - Address all review comments
   - Ensure CI/CD passes
   - Update documentation if needed
   - Squash commits if requested

3. **Merge Requirements**:
   - At least 2 approving reviews
   - All CI checks passing
   - Up-to-date with main branch
   - No conflicts

## 🧪 Testing Requirements

### Smart Contracts
```bash
# Run all tests
anchor test

# Run specific test file
anchor test --skip-lint tests/fund_manager.ts

# Test on different networks
anchor test --provider.cluster devnet
```

### Frontend
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Code Coverage
- Minimum 80% test coverage for new code
- 95% coverage for smart contracts
- Include both positive and negative test cases

## 🔒 Security Guidelines

### Secure Development Practices

1. **Smart Contract Security**:
   - Follow [Solana security best practices](https://docs.solana.com/developing/programming-model/security)
   - Use Anchor's built-in security features
   - Implement proper access controls
   - Validate all inputs and constraints

2. **Code Review Focus**:
   - Check for reentrancy vulnerabilities
   - Verify proper error handling
   - Ensure access controls are correct
   - Review economic incentives and potential exploits

3. **Dependency Management**:
   - Keep dependencies updated
   - Use `npm audit` and `cargo audit`
   - Pin dependency versions in production

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security@maek.finance
2. Include detailed description and reproduction steps
3. Wait for acknowledgment before disclosure
4. Coordinate disclosure timeline with maintainers

## 📚 Documentation Standards

### Code Documentation
- **Rust**: Use `///` for public APIs with examples
- **TypeScript**: Use JSDoc comments for all public functions
- **README**: Update relevant README files for significant changes

### API Documentation
- Use OpenAPI/Swagger for REST APIs
- Include request/response examples
- Document error codes and messages
- Provide SDKs and integration examples

### User Documentation
- Write clear, step-by-step instructions
- Include screenshots for UI changes
- Provide troubleshooting guides
- Translate to major languages (English, Spanish, Mandarin)

## 🎨 Design Guidelines

### UI/UX Standards
- Follow the design system in `/docs/design-system.md`
- Ensure WCAG 2.1 AA accessibility compliance
- Test on mobile and desktop viewports
- Use consistent color palette and typography

### Component Development
- Create reusable components
- Follow atomic design principles
- Include Storybook stories for components
- Write unit tests for interactive components

## 🌐 Community Guidelines

### Communication Standards
- Be respectful and inclusive
- Use clear, professional language
- Provide constructive feedback
- Help newcomers get started

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please read and follow these guidelines.

### Getting Help
- **Discord**: Join our [development channel](https://discord.gg/maek-dev)
- **GitHub Discussions**: For design discussions and Q&A
- **Office Hours**: Weekly contributor calls (Fridays 2 PM UTC)

## 🏆 Recognition

### Contributor Recognition
- Listed in CONTRIBUTORS.md
- Featured in monthly community updates
- Invitation to contributor events
- Priority access to governance tokens

### Bounty Programs
- **Bug Bounties**: $100-$10,000 based on severity
- **Feature Bounties**: $500-$5,000 for priority features
- **Documentation Bounties**: $100-$1,000 for comprehensive guides

## 📝 License

By contributing to MAEK, you agree that your contributions will be licensed under the MIT License.

## 🚨 Important Notes

### Financial Regulations
This project deals with financial instruments and may be subject to various regulations. Contributors should:
- Understand relevant financial regulations
- Not provide investment advice
- Include appropriate disclaimers
- Consult legal experts when uncertain

### Experimental Software
This is experimental software dealing with financial assets. All contributors should:
- Prioritize security in all development
- Test thoroughly before proposing changes
- Consider economic implications of changes
- Be transparent about risks and limitations

## 📞 Contact

- **General Questions**: [contribute@maek.finance](mailto:contribute@maek.finance)
- **Security Issues**: [security@maek.finance](mailto:security@maek.finance)
- **Partnership Inquiries**: [partnerships@maek.finance](mailto:partnerships@maek.finance)

---

Thank you for contributing to the democratization of finance! 🎉 