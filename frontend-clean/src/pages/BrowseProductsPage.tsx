import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/ui';
import apiService from '../services/api.service';
import type { Post } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search, MapPin, Calendar, IndianRupee, Package, ShoppingCart, Eye } from 'lucide-react';
import { format } from 'date-fns';

export function BrowseProductsPage() {
  const [products, setProducts] = useState<Post[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAvailablePosts();
      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
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
      <div>
        <h1 className="text-3xl font-bold">Browse Products</h1>
        <p className="text-gray-600 mt-1">Find farm products from verified farmers</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by product name, farmer, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="size-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Check back later for new products'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.productName}</CardTitle>
                  <Badge className="bg-green-500">Available</Badge>
                </div>
                <p className="text-sm text-gray-600">by {product.farmerName}</p>
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
                    <span className="font-medium">{product.quantity} kg available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="size-4 text-gray-500" />
                    <span className="font-medium text-lg text-green-600">
                      ₹{product.price}/kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-gray-500" />
                    <span className="text-gray-600">
                      Harvested: {format(new Date(product.harvestDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-gray-500" />
                    <span className="text-gray-600 truncate">
                      {product.location.address}
                    </span>
                  </div>
                </div>

                {/* Blockchain Verified Badge */}
                {product.blockchainTxHash && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-700 font-medium">
                      ✓ Blockchain Verified
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
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <ShoppingCart className="size-4 mr-2" />
                    Buy
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