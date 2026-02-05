import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/ui';
import apiService from '../services/api.service';
import type { Post } from '@/types';
import { toast } from 'sonner';
import { Loader2, Package, Eye, RefreshCw, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export function OwnedProductsPage() {
  const [products, setProducts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getOwnedPosts();
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading owned products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-start">
        <Loader2 className="size-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Owned Products</h1>
          <p className="text-gray-600 mt-1">Products you own through the blockchain</p>
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="size-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No owned products</h3>
            <p className="text-gray-600 mb-6">Purchase products to see them here</p>
            <Button onClick={() => navigate('/browse')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.productName}</CardTitle>
                  <Badge className="bg-blue-500">Owned</Badge>
                </div>
                {product.farmerName && (
                  <p className="text-sm text-gray-600">Original farmer: {product.farmerName}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Image */}
                {product.images && product.images.length > 0 && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${product.images[0]}`}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                      }}
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-gray-500" />
                    <span className="font-medium">{product.quantity} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="size-4 text-gray-500" />
                    <span className="font-medium">Purchased at ₹{product.price}/kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-gray-500" />
                    <span className="text-gray-600">
                      {format(new Date(product.harvestDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-gray-500" />
                    <span className="text-gray-600 truncate">
                      {product.location.address}
                    </span>
                  </div>
                </div>

                {/* Blockchain Info */}
                {product.blockchainTxHash && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs text-blue-700 font-medium text-center">
                      ✓ Blockchain Verified Ownership
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/timeline/${product.postId}`)}
                  >
                    <Eye className="size-4 mr-2" />
                    Timeline
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/repost/${product.postId}`)}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Repost
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}