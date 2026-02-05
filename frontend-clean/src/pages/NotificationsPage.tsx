import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/ui';
import apiService from '../services/api.service';
import type { BuyRequest } from '@/types';
import { toast } from 'sonner';
import { Loader2, Check, X, Bell, ShoppingCart, User, Package } from 'lucide-react';
import { format } from 'date-fns';

export function NotificationsPage() {
  const [requests, setRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await apiService.getFarmerRequests();
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: 'Approved' | 'Rejected') => {
    setProcessingId(requestId);
    try {
      const response = await apiService.updateRequestStatus(requestId, status);
      
      if (response.data.success) {
        toast.success(`Request ${status.toLowerCase()} successfully`);
        loadRequests();
      }
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500';
      case 'Approved':
        return 'bg-green-500';
      case 'Rejected':
        return 'bg-red-500';
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
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600 mt-1">Buy requests from distributors</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="size-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-gray-600">You'll see buy requests from distributors here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Buy Request</CardTitle>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Distributor Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="size-4 text-gray-500" />
                      <span className="font-medium">Distributor:</span>
                      <span>{request.distributorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingCart className="size-4 text-gray-500" />
                      <span className="font-medium">Requested Quantity:</span>
                      <span>{request.quantity} kg</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="size-4 text-gray-500" />
                      <span className="font-medium">Product:</span>
                      <span>{request.post?.productName}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested on {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'Pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleUpdateRequest(request._id, 'Approved')}
                      disabled={processingId === request._id}
                    >
                      {processingId === request._id ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <Check className="size-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleUpdateRequest(request._id, 'Rejected')}
                      disabled={processingId === request._id}
                    >
                      {processingId === request._id ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <X className="size-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}