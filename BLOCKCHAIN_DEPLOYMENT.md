# Blockchain Deployment Guide

## ✅ Contract Integration Complete!

Your backend is now configured to interact with the ProduceTraceability smart contract.

### Files Created:

- ✅ `backend/config/blockchain.js` - Blockchain configuration and connection setup
- ✅ `backend/services/blockchainService.js` - Service to interact with contract methods
- ✅ `traceability/scripts/deploy.ts` - Deployment script
- ✅ `traceability/hardhat.config.ts` - Updated with testnet configs

---

## 🚀 Testnet Deployment Steps

### Current Status:

- **Wallet Address**: `0x0A72FaDe3121a037e8fd1ae56f38e8485aa02182`
- **Balance**: 0 (needs testnet tokens)

### Step 1: Get Testnet Tokens

#### Option A: Polygon Amoy Testnet (Recommended - Lower Gas Fees)

1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Enter your wallet address: `0x0A72FaDe3121a037e8fd1ae56f38e8485aa02182`
4. Complete captcha and request tokens
5. Wait ~1-2 minutes for tokens to arrive

#### Option B: Ethereum Sepolia Testnet

1. Visit: https://sepoliafaucet.com/ OR https://faucet.quicknode.com/ethereum/sepolia
2. Enter your wallet address: `0x0A72FaDe3121a037e8fd1ae56f38e8485aa02182`
3. Complete verification and request tokens

### Step 2: Deploy to Testnet

After receiving testnet tokens, run:

```bash
# For Polygon Amoy (Recommended)
cd traceability
npx hardhat run scripts/deploy.ts --network amoy

# OR for Ethereum Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

### Step 3: Update Backend Configuration

After deployment, you'll get a contract address like:

```
ProduceTraceability deployed to: 0xABC123...
```

Update `backend/.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
BLOCKCHAIN_PRIVATE_KEY=0x8613dcdc6440fdb0aa4072d553de4cf120375e71c1c03e3235a674d5d9465fd4
CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS_HERE>
```

### Step 4: Initialize Backend

In your `backend/server.js`, add:

```javascript
const { initializeBlockchain } = require("./config/blockchain");

// Initialize blockchain connection
initializeBlockchain();
```

---

## 📝 Using the Blockchain Service

### Example: Create a Batch

```javascript
const blockchainService = require("./services/blockchainService");

// Create a new batch
const result = await blockchainService.createBatch(
  "BATCH001", // batchId
  1000, // quantity in kg
  "FARMER001", // farmerId
  {
    // metadata
    product: "Tomatoes",
    origin: "Maharashtra",
    harvestDate: "2026-02-04",
  },
);

console.log("Transaction Hash:", result.transactionHash);
console.log("Batch created on block:", result.blockNumber);
```

### Example: Transfer Batch

```javascript
const result = await blockchainService.transferBatch(
  "BATCH001", // batchId
  "DISTRIBUTOR001", // new holder ID
);
```

### Example: Get Batch Details

```javascript
const batch = await blockchainService.getBatch("BATCH001");
console.log("Current Holder:", batch.batch.holderId);
console.log("Quantity:", batch.batch.quantity);
console.log("History:", batch.batch.history);
```

---

## 🔗 Testnet Block Explorers

After deployment, view your contract on:

- **Polygon Amoy**: https://amoy.polygonscan.com/
- **Ethereum Sepolia**: https://sepolia.etherscan.io/

Search for your contract address or transaction hash.

---

## ⚠️ Important Notes

1. **Never commit private keys** to Git
2. **Test thoroughly** on testnet before mainnet
3. **Gas fees** are free on testnet but cost real money on mainnet
4. **Keep your .env file secure**

---

## 📊 Current Configuration

**Wallet**: `0x0A72FaDe3121a037e8fd1ae56f38e8485aa02182`

**Available Networks:**

- Local: `http://127.0.0.1:8545` (Hardhat)
- Sepolia: `https://eth-sepolia.public.blastapi.io`
- Amoy: `https://rpc-amoy.polygon.technology`
- Polygon Mainnet: (Configure when ready)

---

## Next Steps

1. ✅ Get testnet tokens (see Step 1 above)
2. ⏳ Deploy contract to testnet
3. ⏳ Update backend .env with contract address
4. ⏳ Test blockchain integration with backend
5. ⏳ Build frontend integration
