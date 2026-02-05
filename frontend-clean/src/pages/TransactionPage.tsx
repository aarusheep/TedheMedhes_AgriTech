import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/ui';
import { useWalletContext } from '../context/WalletContext';
import apiService from '../services/api.service';
import blockchainService from '../services/blockchain.service';
import type { Post } from '@/types';
import { toast } from 'sonner';
import { Loader2, CreditCard, CheckCircle, Wallet, Package } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function TransactionPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isConnected, connect, signer, address } = useWalletContext();
  
  const [product, setProduct] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'payment' | 'blockchain' | 'success'>('payment');

  useEffect(() => {
    if (postId) {
      loadProduct();
    }
  }, [postId]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPostById(postId!);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPay = async () => {
    if (!product) return;

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      await connect();
      return;
    }

    if (!signer || !address) {
      toast.error('Wallet not properly connected');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create Razorpay order
      const amount = product.price * product.quantity;
      const orderResponse = await apiService.createOrder(postId!, amount);

      if (!orderResponse.data.success) {
        throw new Error('Failed to create order');
      }

      const { orderId, amount: orderAmount, currency } = orderResponse.data.data;

      // Step 2: Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY',
        amount: orderAmount,
        currency: currency,
        name: 'Farm Traceability',
        description: `Purchase: ${product.productName}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              postId: postId!,
            });

            if (!verifyResponse.data.success) {
              throw new Error('Payment verification failed');
            }

            toast.success('Payment successful!');
            setStep('blockchain');

            // Step 4: Transfer ownership on blockchain
            toast.info('Transferring ownership on blockchain...');
            const txHash = await blockchainService.transferOwnership(
              product.postId,
              address,
              signer
            );

            toast.success('Ownership transferred successfully!');
            setStep('success');

          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
            setProcessing(false);
          }
        },
        prefill: {
          name: 'Distributor',
          email: 'distributor@example.com',
        },
        theme: {
          color: '#16a34a',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-start">
        <Loader2 className="size-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-gray-600">Product not found</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <div className="w-full max-w-5xl mx-auto px-6">
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="mx-auto size-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Transaction Successful!</h2>
              <p className="text-gray-600">
                You are now the owner of {product.productName}
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{product.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{product.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-bold text-green-600">
                  ₹{(product.price * product.quantity).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => navigate('/owned-products')}>
                View My Products
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate('/browse')}>
                Browse More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold">Complete Transaction</h1>
        <p className="text-gray-600 mt-1">Review and complete your purchase</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-4 pb-4 border-b">
            {product.images && product.images.length > 0 && (
              <div className="size-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${product.images[0]}`}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/100x100?text=Product';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{product.productName}</h3>
              <p className="text-sm text-gray-600">Seller: {product.farmerName}</p>
              <div className="flex items-center gap-2 mt-2">
                <Package className="size-4 text-gray-500" />
                <span className="text-sm">{product.quantity} kg</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per kg:</span>
              <span>₹{product.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity:</span>
              <span>{product.quantity} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{(product.price * product.quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">₹{(product.price * product.quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="size-5 text-blue-600" />
              <span className="font-medium">Wallet Status</span>
            </div>
            {isConnected ? (
              <p className="text-sm text-gray-600">
                Connected: {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            ) : (
              <p className="text-sm text-gray-600">Please connect your wallet to proceed</p>
            )}
          </div>

          {/* Processing Status */}
          {processing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-yellow-600" />
                <div>
                  {step === 'payment' && <p className="text-sm">Processing payment...</p>}
                  {step === 'blockchain' && <p className="text-sm">Transferring ownership on blockchain...</p>}
                </div>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleProceedToPay}
            disabled={processing || !isConnected}
          >
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="size-4 mr-2" />
                Proceed to Pay ₹{(product.price * product.quantity).toFixed(2)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}