import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/ui';
import apiService from '../services/api.service';
import type { Post } from '@/types';
import { toast } from 'sonner';
import { Loader2, Package, Eye, QrCode, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export function FarmerDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getMyPosts();
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Sold':
        return 'bg-blue-500';
      case 'InTransit':
        return 'bg-yellow-500';
      case 'Delivered':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
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
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-gray-600 mt-1">Manage your farm products</p>
        </div>
        <Button onClick={() => navigate('/create-post')} size="lg">
          Create New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="size-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Create your first product to get started</p>
            <Button onClick={() => navigate('/create-post')}>
              Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{post.productName}</CardTitle>
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Image */}
                {post.images && post.images.length > 0 && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${post.images[0]}`}
                      alt={post.productName}
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
                    <span className="font-medium">{post.quantity} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="size-4 text-gray-500" />
                    <span className="font-medium">₹{post.price}/kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-gray-500" />
                    <span className="text-gray-600">
                      {format(new Date(post.harvestDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-gray-500" />
                    <span className="text-gray-600 truncate">
                      {post.location.address}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/timeline/${post.postId}`)}
                  >
                    <Eye className="size-4 mr-2" />
                    Timeline
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/qr/${post.postId}`)}
                  >
                    <QrCode className="size-4 mr-2" />
                    QR Code
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