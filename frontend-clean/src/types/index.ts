// User and Authentication Types
export interface User {
  _id: string;
  mobile: string;
  role: 'Farmer' | 'Distributor';
  name?: string;
  walletAddress?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

// Product Post Types
export interface Post {
  _id: string;
  postId: string; // blockchain ID
  farmerId: string;
  farmerName: string;
  productName: string;
  quantity: number;
  price: number;
  harvestDate: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[]; // IPFS hashes
  status: 'Available' | 'Sold' | 'InTransit' | 'Delivered';
  blockchainTxHash?: string;
  currentOwnerId?: string;
  currentOwnerName?: string;
  currentOwnerRole?: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface BuyRequest {
  _id: string;
  postId: string;
  post: Post;
  distributorId: string;
  distributorName: string;
  farmerId: string;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

// Timeline Types
export interface TimelineEvent {
  _id: string;
  type: 'Created' | 'Transfer' | 'Payment' | 'Repost';
  postId: string;
  timestamp: string;
  fromUser: {
    id: string;
    name: string;
    role: string;
  };
  toUser?: {
    id: string;
    name: string;
    role: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  price?: number;
  quantity?: number;
  blockchainTxHash?: string;
  metadata?: Record<string, any>;
}

export interface Timeline {
  post: Post;
  events: TimelineEvent[];
}

// Payment Types
export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  postId: string;
}

// Wallet Types
export interface WalletContextType {
  address: string | null;
  provider: any;
  signer: any;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (data: any) => Promise<string>;
}

// Repost Types
export interface RepostData {
  originalPostId: string;
  newPrice: number;
  quantity: number;
  description?: string;
  images?: File[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
