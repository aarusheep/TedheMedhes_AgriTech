import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { USE_MOCK } from '@/config/mock';

// Configure your backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        // Preserve server-provided `success` boolean when present,
        // otherwise normalize to { success: true, data }
        const original = response.data;
        if (original && typeof original.success === 'boolean') {
          response.data = original;
        } else {
          response.data = { success: true, data: original };
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async sendOTP(mobile: string) {
    return this.api.post('/api/auth/send-otp', { mobile });
  }

  // verifyOTP can accept optional meta for signup flows
  async verifyOTP(mobile: string, otp: string, meta?: Record<string, any>) {
    const payload: any = { mobile, otp };
    if (meta) Object.assign(payload, meta);
    return this.api.post('/api/auth/verify-otp', payload);
  }

  // Post endpoints
  async getMyPosts() {
    return this.api.get('/api/posts/my-posts');
  }

async getAvailablePosts() {
  if (USE_MOCK) {
    return Promise.resolve({
      data: {
        success: true,
        data: [
          {
            _id: 'p1',
            postId: 'POST111',
            farmerName: 'Ramesh Patil',
            productName: 'Tomatoes',
            quantity: 50,
            price: 1200,
            status: 'Available',
            harvestDate: '2026-01-10',
            location: { address: 'Nashik, Maharashtra' },
            images: [],
          },
        ],
      },
    });
  }

  return this.api.get('/api/posts/available');
}

async getOwnedPosts() {
  if (USE_MOCK) {
    return Promise.resolve({
      data: {
        success: true,
        data: [
          {
            _id: 'o1',
            postId: 'POST999',
            farmerName: 'Suresh Kale',
            productName: 'Onions',
            quantity: 30,
            price: 1500,
            status: 'Delivered', // 👈 important
            harvestDate: '2026-01-05',
            location: { address: 'Pune, Maharashtra' },
            images: [],
            currentOwnerName: 'Apoorva Distributor',
          },
        ],
      },
    });
  }

  return this.api.get('/api/posts/owned');
}

async getPostById(postId: string) {
  if (USE_MOCK) {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          _id: 'o1',
          postId,
          farmerName: 'Suresh Kale',
          productName: 'Onions',
          quantity: 30,
          price: 1500,
          status: 'Delivered',
          harvestDate: '2026-01-05',
          location: { address: 'Pune, Maharashtra' },
          images: [],
          currentOwnerName: 'Apoorva Distributor',
        },
      },
    });
  }

  return this.api.get(`/api/posts/${postId}`);
}

  async createPost(data: FormData) {
    // If FormData provided (from UI), convert files to IPFS hashes then send JSON
    if (data instanceof FormData) {
      const payload: any = {};
      const images: string[] = [];

      for (const pair of data.entries()) {
        const [key, value] = pair as [string, any];
        if (value instanceof File) {
          try {
            const uploadResp = await this.uploadToIPFS(value);
            if (uploadResp.data && uploadResp.data.data && uploadResp.data.data.ipfsHash) {
              images.push(uploadResp.data.data.ipfsHash);
            }
          } catch (err) {
            console.warn('IPFS upload failed for file', err);
          }
        } else if (key === 'location') {
          payload['location'] = value;
        } else if (key === 'productName') {
          payload['productName'] = value;
        } else if (key === 'quantity') {
          payload['quantity'] = value;
        } else if (key === 'price') {
          payload['price'] = value;
        } else if (key === 'harvestDate') {
          payload['harvestDate'] = value;
        } else if (key === 'description') {
          payload['description'] = value;
        }
      }

      if (images.length) payload.images = images;

      return this.api.post('/api/posts/create', payload);
    }

    return this.api.post('/api/posts/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async repostProduct(data: FormData) {
    // Convert FormData to JSON similarly to createPost
    if (data instanceof FormData) {
      const payload: any = {};
      const images: string[] = [];
      for (const pair of data.entries()) {
        const [key, value] = pair as [string, any];
        if (value instanceof File) {
          try {
            const uploadResp = await this.uploadToIPFS(value);
            if (uploadResp.data && uploadResp.data.data && uploadResp.data.data.ipfsHash) {
              images.push(uploadResp.data.data.ipfsHash);
            }
          } catch (err) {
            console.warn('IPFS upload failed for file', err);
          }
        } else {
          payload[key] = value;
        }
      }
      if (images.length) payload.images = images;
      return this.api.post('/api/posts/repost', payload);
    }

    return this.api.post('/api/posts/repost', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getTimeline(postId: string) {
    return this.api.get(`/api/posts/${postId}/timeline`);
  }

  // Request endpoints
  async getFarmerRequests() {
    return this.api.get('/api/requests/farmer');
  }

  async createBuyRequest(postId: string, quantity: number) {
    // Backend expects `listingId` as the field name
    return this.api.post('/api/requests/create', { listingId: postId, quantity });
  }

  async updateRequestStatus(requestId: string, status: 'Approved' | 'Rejected') {
    // Backend route: PUT /api/requests/:id/status and expects lowercase status
    return this.api.put(`/api/requests/${requestId}/status`, { status: status.toLowerCase() });
  }

  // Payment endpoints
  async createOrder(postId: string, amount: number) {
    const resp = await this.api.post('/api/payment/create-order', { postId, amount });

    // Response interceptor normalizes to { success, data }
    const raw = resp.data.data || resp.data;

    // Raw order from server (Razorpay) usually contains `id`, `amount`, `currency`.
    const normalized = {
      orderId: raw.id || raw.orderId || raw.order_id,
      amount: raw.amount,
      currency: raw.currency || 'INR',
    };

    return { data: { success: true, data: normalized } } as any;
  }

  async verifyPayment(verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    postId: string;
  }) {
    return this.api.post('/api/payment/verify', verificationData);
  }

  // Upload image to IPFS via backend
  async uploadToIPFS(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post('/api/ipfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

// Selling posts (reposted by distributor)
async getSellingPosts() {
  if (USE_MOCK) {
    return Promise.resolve({
      data: {
        success: true,
        data: [
          {
            postId: 'POST999',
            productName: 'Onions (Reposted)',
            quantity: 30,
            price: 2000,
            status: 'Available',
          },
        ],
      },
    });
  }

  return this.api.get('/api/posts/selling');
}

// 🔐 AUTH (password based)

async register(data: {
  name: string;
  mobile: string;
  password: string;
  role: string;
}) {
  return this.api.post('/api/auth/register', data);
}

async login(data: {
  mobile: string;
  password: string;
}) {
  return this.api.post('/api/auth/login', data);
}


}

export default new ApiService();
