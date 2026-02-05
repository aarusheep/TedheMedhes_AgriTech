// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  chainId: import.meta.env.VITE_CHAIN_ID || '80001',
  network: import.meta.env.VITE_NETWORK || 'mumbai',
};

// Razorpay Configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY';

// IPFS Configuration
export const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// App Configuration
export const APP_NAME = 'Farm Traceability & Marketplace';
export const APP_VERSION = '1.0.0';

// Pagination
export const ITEMS_PER_PAGE = 12;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Status Colors
export const STATUS_COLORS = {
  Available: 'bg-green-500',
  Sold: 'bg-blue-500',
  InTransit: 'bg-yellow-500',
  Delivered: 'bg-purple-500',
  Pending: 'bg-yellow-500',
  Approved: 'bg-green-500',
  Rejected: 'bg-red-500',
};

// Network Names
export const NETWORK_NAMES: Record<string, string> = {
  '1': 'Ethereum Mainnet',
  '5': 'Goerli Testnet',
  '137': 'Polygon Mainnet',
  '80001': 'Mumbai Testnet',
};

// Explorer URLs
export const EXPLORER_URLS: Record<string, string> = {
  '1': 'https://etherscan.io',
  '5': 'https://goerli.etherscan.io',
  '137': 'https://polygonscan.com',
  '80001': 'https://mumbai.polygonscan.com',
};
