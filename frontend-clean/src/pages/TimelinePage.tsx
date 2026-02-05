import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/ui';
import apiService from '../services/api.service';
import blockchainService from '../services/blockchain.service';
import type { Timeline } from '@/types';
import { toast } from 'sonner';
import { Loader2, MapPin, Calendar, User, Package, IndianRupee, ExternalLink, Truck, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function TimelinePage() {
  const { postId } = useParams<{ postId: string }>();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadTimeline();
    }
  }, [postId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTimeline(postId!);
      if (response.data.success) {
        setTimeline(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading timeline:', error);
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Created':
        return <Package className="size-5 text-green-600" />;
      case 'Transfer':
        return <Truck className="size-5 text-blue-600" />;
      case 'Payment':
        return <IndianRupee className="size-5 text-yellow-600" />;
      case 'Repost':
        return <CheckCircle className="size-5 text-purple-600" />;
      default:
        return <Package className="size-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-start">
        <Loader2 className="size-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!timeline) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-gray-600">Timeline not found</p>
        </CardContent>
      </Card>
    );
  }

  const { post, events } = timeline;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold">Product Traceability</h1>
        <p className="text-gray-600 mt-1">Complete journey from farm to consumer</p>
      </div>

      {/* Product Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{post.productName}</CardTitle>
              <p className="text-gray-600 mt-1">Post ID: {post.postId}</p>
            </div>
            <Badge className="bg-green-600">
              {post.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Image */}
            {post.images && post.images.length > 0 && (
              <div className="aspect-video bg-white rounded-lg overflow-hidden shadow-md">
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

            {/* Product Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="size-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Original Farmer</p>
                  <p className="font-medium">{post.farmerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="size-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{post.quantity} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="size-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium">₹{post.price}/kg</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Harvest Date</p>
                  <p className="font-medium">{format(new Date(post.harvestDate), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{post.location.address}</p>
                </div>
              </div>
              {post.currentOwnerName && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Current Owner</p>
                    <p className="font-medium">{post.currentOwnerName} ({post.currentOwnerRole})</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Info */}
          {post.blockchainTxHash && (
            <div className="mt-6 bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-blue-600" />
                  <span className="font-medium">Blockchain Verified</span>
                </div>
                <a
                  href={blockchainService.getExplorerLink(post.blockchainTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View on Explorer
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => (
                <div key={event._id} className="relative pl-16">
                  {/* Icon */}
                  <div className="absolute left-0 top-0 size-12 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{event.type}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.timestamp), 'MMMM dd, yyyy • HH:mm')}
                        </p>
                      </div>
                      {index === 0 && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Origin
                        </Badge>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-4 text-gray-500" />
                        <span className="font-medium">{event.fromUser.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {event.fromUser.role}
                        </Badge>
                      </div>

                      {event.toUser && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">→ Transferred to</span>
                          <span className="font-medium">{event.toUser.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {event.toUser.role}
                          </Badge>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="size-4 text-gray-500" />
                          <span className="text-gray-600">{event.location.address}</span>
                        </div>
                      )}

                      {event.quantity && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="size-4 text-gray-500" />
                          <span className="text-gray-600">{event.quantity} kg</span>
                        </div>
                      )}

                      {event.price && (
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="size-4 text-gray-500" />
                          <span className="text-gray-600">₹{event.price}/kg</span>
                        </div>
                      )}

                      {event.blockchainTxHash && (
                        <div className="mt-2">
                          <a
                            href={blockchainService.getExplorerLink(event.blockchainTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Transaction on Blockchain
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map View (if location data available) */}
      {post.location && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <MapPin className="size-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">
                {post.location.address}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Coordinates: {post.location.lat}, {post.location.lng}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}