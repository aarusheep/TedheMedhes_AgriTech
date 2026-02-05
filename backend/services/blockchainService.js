const { ethers } = require('ethers');
const { getContract, getProvider } = require('../config/blockchain');

/**
 * Blockchain Service for ProduceTraceability Contract
 */
class BlockchainService {
  
  /**
   * Create a new batch on the blockchain
   * @param {string} batchId - Unique batch identifier
   * @param {number} quantity - Batch quantity
   * @param {string} farmerId - Farmer/holder ID
   * @param {object} metadata - Additional batch data to hash
   * @returns {Promise<object>} Transaction receipt
   */
  async createBatch(batchId, quantity, farmerId, metadata = {}) {
    try {
      const contract = getContract();
      
      // Create data hash from metadata
      const dataHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(metadata))
      );
      
      // Send transaction
      const tx = await contract.createBatch(
        batchId,
        quantity,
        farmerId,
        dataHash
      );
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        batchId,
        dataHash
      };
    } catch (error) {
      console.error('Error creating batch:', error);
      throw new Error(`Failed to create batch: ${error.message}`);
    }
  }

  /**
   * Transfer batch to a new holder
   * @param {string} batchId - Batch ID to transfer
   * @param {string} toId - New holder ID
   * @returns {Promise<object>} Transaction receipt
   */
  async transferBatch(batchId, toId) {
    try {
      const contract = getContract();
      
      const tx = await contract.transferBatch(batchId, toId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        batchId,
        newHolder: toId
      };
    } catch (error) {
      console.error('Error transferring batch:', error);
      throw new Error(`Failed to transfer batch: ${error.message}`);
    }
  }

  /**
   * Split a batch into parent and child
   * @param {string} parentId - Parent batch ID
   * @param {string} childId - New child batch ID
   * @param {number} quantity - Quantity to split
   * @param {string} newHolder - Holder ID for child batch
   * @param {object} metadata - Metadata for child batch
   * @returns {Promise<object>} Transaction receipt
   */
  async splitBatch(parentId, childId, quantity, newHolder, metadata = {}) {
    try {
      const contract = getContract();
      
      const dataHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(metadata))
      );
      
      const tx = await contract.splitBatch(
        parentId,
        childId,
        quantity,
        newHolder,
        dataHash
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        parentId,
        childId,
        quantity
      };
    } catch (error) {
      console.error('Error splitting batch:', error);
      throw new Error(`Failed to split batch: ${error.message}`);
    }
  }

  /**
   * Get batch details from blockchain
   * @param {string} batchId - Batch ID to query
   * @returns {Promise<object>} Batch details
   */
  async getBatch(batchId) {
    try {
      const contract = getContract();
      
      const result = await contract.getBatch(batchId);
      
      // Parse result tuple
      const [
        id,
        parentBatchId,
        quantity,
        holderId,
        dataHash,
        status,
        history
      ] = result;
      
      // Status enum mapping
      const statusMap = ['CREATED', 'SPLIT', 'TRANSFERRED', 'SOLD'];
      
      // Format history
      const formattedHistory = history.map(event => ({
        action: event.action,
        fromId: event.fromId,
        toId: event.toId,
        timestamp: Number(event.timestamp),
        date: new Date(Number(event.timestamp) * 1000).toISOString()
      }));
      
      return {
        success: true,
        batch: {
          batchId: id,
          parentBatchId,
          quantity: Number(quantity),
          holderId,
          dataHash,
          status: statusMap[status],
          history: formattedHistory
        }
      };
    } catch (error) {
      console.error('Error getting batch:', error);
      throw new Error(`Failed to get batch: ${error.message}`);
    }
  }

  /**
   * Check if a batch exists
   * @param {string} batchId - Batch ID to check
   * @returns {Promise<boolean>} Existence status
   */
  async batchExists(batchId) {
    try {
      await this.getBatch(batchId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current gas price
   * @returns {Promise<string>} Gas price in Gwei
   */
  async getGasPrice() {
    try {
      const provider = getProvider();
      const gasPrice = await provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice, 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '0';
    }
  }

  /**
   * Get wallet balance
   * @param {string} address - Wallet address
   * @returns {Promise<string>} Balance in ETH/MATIC
   */
  async getBalance(address) {
    try {
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }
}

module.exports = new BlockchainService();
