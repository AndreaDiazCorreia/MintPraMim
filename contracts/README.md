# MintPraMim Contracts - README

## Overview

MintPraMim is a blockchain-based application that facilitates connections between users based on their POAP collections, focusing on creating matches based on similar interests evidenced by POAP ownership. The application uses Arbitrum Stylus for smart contract development, leveraging Rust for improved performance and security.

This repository contains the smart contracts for the MintPraMim platform, handling user registration, POAP verification, and economic incentives through a boost system.

## Technical Stack

- **Blockchain**: Arbitrum (Stylus VM)
- **Smart Contract Language**: Rust
- **Stylus SDK Version**: 0.6.0
- **Dependencies**: Alloy Primitives (0.7.6), Alloy Sol Types (0.7.6)

## Smart Contract Architecture

The system consists of three main contracts that work together:

1. **MainContract**: Central contract that coordinates user registration and interactions
2. **POAPVerifier**: Handles verification of POAP ownership
3. **BoostManager**: Manages the economic incentive system for profile visibility

```
             ┌───────────────────┐
             │                   │
             │   MainContract    │
             │                   │
             └─────────▲─────────┘
                       │
                       │ coordinates
                       │
          ┌────────────┴────────────┐
          │                         │
┌─────────▼──────────┐    ┌─────────▼──────────┐
│                    │    │                    │
│   POAPVerifier     │    │   BoostManager     │
│                    │    │                    │
└────────────────────┘    └────────────────────┘
```

## Contract Details

### MainContract

The central contract that handles user registration and coordinates the interaction between other contracts.

**Key Functions:**
- `init()`: Initializes the contract with default values
- `set_contracts(poap_verifier, boost_manager)`: Sets the addresses of associated contracts
- `register_user()`: Registers a new user (requires payment)
- `verify_poap(poap_id)`: Verifies a user's POAP and updates their status
- `report_match(user1, user2)`: Records a match between two users
- `get_registration_fee()`: Returns the current registration fee
- `update_registration_fee(new_fee)`: Updates the registration fee

**Events:**
- `UserRegistered(address indexed user, uint256 timestamp)`
- `MatchReported(address indexed user1, address indexed user2, uint256 timestamp)`
- `UserUpdated(address indexed user, uint256 timestamp)`

**Errors:**
- `Unauthorized()`: Called by unauthorized address
- `InvalidParameters()`: Invalid input parameters
- `InsufficientPayment()`: Insufficient ETH sent

### POAPVerifier

Manages the verification of POAP ownership for users in the system.

**Key Functions:**
- `init()`: Initializes the contract with default values
- `set_main_contract(main_contract)`: Sets the main contract address
- `verify_poap_ownership(user, poap_id)`: Verifies if a user owns a specific POAP
- `get_last_verified_poap(user)`: Returns the latest verified POAP for a user
- `get_verified_poaps(user)`: Returns all verified POAPs for a user
- `update_poap_contract(new_contract)`: Updates the POAP contract address

**Events:**
- `POAPVerified(address indexed user, uint256 indexed poapId, uint256 timestamp)`

**Errors:**
- `Unauthorized()`: Called by unauthorized address
- `POAPNotOwned()`: User does not own the POAP
- `InvalidPOAP()`: Invalid POAP ID

### BoostManager

Handles the economic incentive system that allows users to boost their visibility.

**Key Functions:**
- `init()`: Initializes the contract with default values
- `set_main_contract(main_contract)`: Sets the main contract address
- `purchase_boost(days)`: Allows users to purchase a boost for a specific duration
- `check_boost_status(user)`: Checks if a user's boost is still active
- `get_boost_level(user)`: Returns the boost level for a user
- `withdraw_funds(to, amount)`: Allows the owner to withdraw accumulated funds
- `update_min_boost_price(new_price)`: Updates the minimum boost price

**Events:**
- `BoostPurchased(address indexed user, uint256 amount, uint256 duration, uint256 timestamp)`
- `BoostExpired(address indexed user, uint256 timestamp)`
- `FundsWithdrawn(address indexed to, uint256 amount, uint256 timestamp)`

**Errors:**
- `Unauthorized()`: Called by unauthorized address
- `InsufficientPayment()`: Insufficient ETH sent
- `NoActiveBoost()`: User has no active boost
- `WithdrawalFailed()`: ETH withdrawal failed

## Project Structure

```
└── 📁contracts
    └── 📁src
        └── lib.rs             # Exports all contract modules
        └── main_contract.rs   # Main contract implementation
        └── poap_verifier.rs   # POAP verification contract
        └── boost_manager.rs   # Boost management contract
    └── Cargo.toml             # Rust package configuration
```

## Setup and Installation

### Prerequisites

1. [Rust](https://www.rust-lang.org/tools/install) (1.77.0 or newer)
2. [cargo-stylus](https://github.com/OffchainLabs/cargo-stylus) CLI tool
3. WebAssembly target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
4. Docker (for contract verification)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AndreaDiazCorreia/MintPraMim/tree/main
   cd contracts
   ```

2. Install dependencies:
   ```bash
   cargo install --force cargo-stylus
   ```

## Compilation and Deployment

### Compiling the Contracts

```bash
# Navigate to the contracts directory
cd contracts

# Build all contracts
cargo build --release

# Export ABIs for each contract
cargo stylus export-abi

# Alternatively, export specific contract ABI
cargo stylus export-abi --contract MainContract
```

### Deployment to Arbitrum Stylus

1. Configure your environment:
   ```bash
   export RPC_URL="your_arbitrum_rpc_endpoint"
   export PRIVATE_KEY="your_private_key"
   ```

2. Deploy each contract:
   ```bash
   # Deploy MainContract
   cargo stylus deploy --private-key=$PRIVATE_KEY --endpoint=$RPC_URL --contract MainContract
   
   # Deploy POAPVerifier
   cargo stylus deploy --private-key=$PRIVATE_KEY --endpoint=$RPC_URL --contract POAPVerifier
   
   # Deploy BoostManager
   cargo stylus deploy --private-key=$PRIVATE_KEY --endpoint=$RPC_URL --contract BoostManager
   ```

3. After deployment, set up the contract references:
   - Call `MainContract.set_contracts()` with the addresses of POAPVerifier and BoostManager
   - Call `POAPVerifier.set_main_contract()` with the address of MainContract
   - Call `BoostManager.set_main_contract()` with the address of MainContract

## Testing

Tests can be run using the standard Rust testing framework:

```bash
cd contracts
cargo test
```

For more thorough testing, deploy to a local testnet or Arbitrum Sepolia testnet.

## Usage Flow

1. Deploy all three contracts
2. Set up contract references
3. Users register through MainContract by paying the registration fee
4. Users verify their POAPs through POAPVerifier
5. Users can purchase boosts through BoostManager to increase their visibility
6. Backend system uses verified POAPs and boost status to calculate matches
7. Matches are recorded on-chain through MainContract

## Important Notes

- The POAPVerifier currently uses a mock implementation for POAP verification. In production, this should be replaced with actual verification through POAP's API or cross-chain communication.
- Ensure proper security audits before deploying to mainnet.
- Boost durations and prices should be calibrated based on testing and user feedback.

## License

[MIT License](LICENSE)

