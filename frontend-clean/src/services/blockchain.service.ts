import { ethers } from 'ethers';

// Smart Contract ABI (minimal interface for farm traceability)
const FARM_CONTRACT_ABI = [
  'function createProduct(string memory productId, string memory ipfsHash) public returns (bool)',
  'function transferOwnership(string memory productId, address newOwner) public returns (bool)',
  'function getProductOwner(string memory productId) public view returns (address)',
  'function getProductHistory(string memory productId) public view returns (address[] memory)',
  'event ProductCreated(string productId, address owner, string ipfsHash, uint256 timestamp)',
  'event OwnershipTransferred(string productId, address from, address to, uint256 timestamp)',
];

class BlockchainService {
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor() {
    // Configure your deployed contract address
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  }

  // Initialize contract with signer
  initContract(signer: ethers.Signer) {
    this.contract = new ethers.Contract(
      this.contractAddress,
      FARM_CONTRACT_ABI,
      signer
    );
  }

  // Create product on blockchain
  async createProduct(productId: string, ipfsHash: string, signer: ethers.Signer): Promise<string> {
    try {
      this.initContract(signer);
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.createProduct(productId, ipfsHash);
      const receipt = await tx.wait();
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Blockchain create product error:', error);
      throw new Error(error.message || 'Failed to create product on blockchain');
    }
  }

  // Transfer ownership on blockchain
  async transferOwnership(
    productId: string,
    newOwnerAddress: string,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      this.initContract(signer);
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.transferOwnership(productId, newOwnerAddress);
      const receipt = await tx.wait();
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Blockchain transfer error:', error);
      throw new Error(error.message || 'Failed to transfer ownership on blockchain');
    }
  }

  // Get product owner
  async getProductOwner(productId: string, provider: ethers.Provider): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARM_CONTRACT_ABI,
        provider
      );

      const owner = await contract.getProductOwner(productId);
      return owner;
    } catch (error: any) {
      console.error('Error getting product owner:', error);
      throw new Error(error.message || 'Failed to get product owner');
    }
  }

  // Get product history
  async getProductHistory(productId: string, provider: ethers.Provider): Promise<string[]> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARM_CONTRACT_ABI,
        provider
      );

      const history = await contract.getProductHistory(productId);
      return history;
    } catch (error: any) {
      console.error('Error getting product history:', error);
      throw new Error(error.message || 'Failed to get product history');
    }
  }

  // Get Polygon explorer link
  getExplorerLink(txHash: string): string {
    const network = import.meta.env.VITE_NETWORK || 'mumbai';
    if (network === 'mainnet') {
      return `https://polygonscan.com/tx/${txHash}`;
    }
    return `https://mumbai.polygonscan.com/tx/${txHash}`;
  }
}

export default new BlockchainService();
