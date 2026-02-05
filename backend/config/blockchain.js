const { ethers } = require('ethers');

// Contract ABI - extracted from compiled artifacts
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "initialOwner", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "batchId", "type": "string" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "internalType": "string", "name": "farmerId", "type": "string" },
      { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" }
    ],
    "name": "createBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "id", "type": "string" }
    ],
    "name": "getBatch",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "bytes32", "name": "", "type": "bytes32" },
      { "internalType": "enum ProduceTraceability.Status", "name": "", "type": "uint8" },
      {
        "components": [
          { "internalType": "string", "name": "action", "type": "string" },
          { "internalType": "string", "name": "fromId", "type": "string" },
          { "internalType": "string", "name": "toId", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct ProduceTraceability.EventLog[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "parentId", "type": "string" },
      { "internalType": "string", "name": "childId", "type": "string" },
      { "internalType": "uint256", "name": "qty", "type": "uint256" },
      { "internalType": "string", "name": "newHolder", "type": "string" },
      { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" }
    ],
    "name": "splitBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "batchId", "type": "string" },
      { "internalType": "string", "name": "toId", "type": "string" }
    ],
    "name": "transferBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Blockchain Configuration - using function to ensure env vars are loaded
const getBlockchainConfig = () => ({
  // Contract address - will be updated after testnet deployment
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  
  // RPC URLs
  RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
  
  // Network configurations
  NETWORKS: {
    LOCAL: 'http://127.0.0.1:8545',
    SEPOLIA: 'https://sepolia.infura.io/v3/' + (process.env.INFURA_API_KEY || ''),
    MUMBAI: 'https://polygon-mumbai.g.alchemy.com/v2/' + (process.env.ALCHEMY_API_KEY || ''),
    POLYGON: 'https://polygon-mainnet.g.alchemy.com/v2/' + (process.env.ALCHEMY_API_KEY || '')
  },
  
  // Private key for signing transactions (should be stored securely in .env)
  PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY
});

// Initialize provider
let provider;
let contract;
let wallet;
let initialized = false;

const initializeBlockchain = () => {
  if (initialized) {
    return true;
  }
  
  try {
    // Get config after env vars are loaded
    const BLOCKCHAIN_CONFIG = getBlockchainConfig();
    
    // Create provider
    provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);
    
    // Debug: Check private key value
    console.log('🔍 Debug - BLOCKCHAIN_CONFIG.PRIVATE_KEY:', BLOCKCHAIN_CONFIG.PRIVATE_KEY ? 'EXISTS' : 'UNDEFINED');
    console.log('🔍 Debug - process.env.BLOCKCHAIN_PRIVATE_KEY:', process.env.BLOCKCHAIN_PRIVATE_KEY ? 'EXISTS' : 'UNDEFINED');
    
    // Create wallet if private key is available
    if (BLOCKCHAIN_CONFIG.PRIVATE_KEY) {
      wallet = new ethers.Wallet(BLOCKCHAIN_CONFIG.PRIVATE_KEY, provider);
      console.log('🔑 Wallet initialized:', wallet.address);
      // Create contract instance with signer for write operations
      contract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_ABI,
        wallet
      );
    } else {
      console.warn('⚠️  No private key found. Running in read-only mode.');
      // Read-only contract instance
      contract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
    }
    
    console.log('✅ Blockchain connection initialized');
    console.log('📍 Contract Address:', BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS);
    console.log('🌐 Network:', BLOCKCHAIN_CONFIG.RPC_URL);
    
    initialized = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize blockchain:', error.message);
    initialized = true; // Mark as initialized even on error to prevent infinite retry
    return false;
  }
};

// Get contract instance
const getContract = () => {
  if (!contract) {
    initializeBlockchain();
  }
  return contract;
};

// Get provider
const getProvider = () => {
  if (!provider) {
    initializeBlockchain();
  }
  return provider;
};

// Get wallet
const getWallet = () => {
  if (!wallet) {
    initializeBlockchain();
  }
  return wallet;
};

module.exports = {
  CONTRACT_ABI,
  getBlockchainConfig,
  initializeBlockchain,
  getContract,
  getProvider,
  getWallet
};
