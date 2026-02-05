import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge } from '@/ui';
import apiService from '../services/api.service';
import type { Post } from '@/types';
import { toast } from 'sonner';
import { Loader2, MapPin, Calendar, IndianRupee, Package, User, ShoppingCart, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPostById(id!);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToBuy = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (product && parseFloat(quantity) > product.quantity) {
      toast.error(`Maximum available quantity is ${product.quantity} kg`);
      return;
    }

    setRequesting(true);
    try {
      const response = await apiService.createBuyRequest(id!, parseFloat(quantity));
      
      if (response.data.success) {
        toast.success('Buy request sent to farmer. You will be notified once approved.');
        navigate('/browse');
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setRequesting(false);
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
          <Button onClick={() => navigate('/browse')} className="mt-4">
            Back to Browse
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-6">
      <Button variant="outline" onClick={() => navigate('/browse')}>
        ← Back to Browse
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Images */}
        <div className="lg:col-span-2 space-y-4">
          {product.images && product.images.length > 0 && (
            <>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${product.images[0]}`}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600?text=Product+Image';
                  }}
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${image}`}
                        alt={`${product.productName} ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/200x200?text=Image';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Info & Purchase */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{product.productName}</CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-green-500">Available</Badge>
                {product.blockchainTxHash && (
                  <Badge variant="outline" className="border-blue-500 text-blue-700">
                    <CheckCircle className="size-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price per kg</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{product.price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium">{product.quantity} kg</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-gray-500" />
                  <span className="text-gray-600">Farmer:</span>
                  <span className="font-medium">{product.farmerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-gray-500" />
                  <span className="text-gray-600">Harvested:</span>
                  <span>{format(new Date(product.harvestDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-gray-500" />
                  <span className="text-gray-600">{product.location.address}</span>
                </div>
              </div>

              {/* Request to Buy */}
              <div className="border-t pt-4 space-y-3">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  max={product.quantity}
                />
                {quantity && parseFloat(quantity) > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quantity:</span>
                      <span>{quantity} kg</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Price per kg:</span>
                      <span>₹{product.price}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1 mt-1">
                      <span>Total:</span>
                      <span>₹{(parseFloat(quantity) * product.price).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={handleRequestToBuy}
                  disabled={requesting || !quantity || parseFloat(quantity) <= 0}
                >
                  {requesting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="size-4 mr-2" />
                      Request to Buy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}