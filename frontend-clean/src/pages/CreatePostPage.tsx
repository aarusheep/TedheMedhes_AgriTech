import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from '@/ui';
import { useWalletContext } from '../context/WalletContext';
import apiService from '../services/api.service';
import blockchainService from '../services/blockchain.service';
import { toast } from 'sonner';
import { Loader2, Upload, MapPin, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui';
import { QRCodeSVG } from 'qrcode.react';

export function CreatePostPage() {
  const navigate = useNavigate();
  const { isConnected, connect, signer } = useWalletContext();
  
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    harvestDate: '',
    location: {
      lat: 28.6139, // Default: Delhi
      lng: 77.2090,
      address: '',
    },
    description: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'blockchain' | 'success'>('form');
  const [createdPostId, setCreatedPostId] = useState<string>('');
  const [showQRDialog, setShowQRDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [name]: value },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Create previews
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.productName || !formData.quantity || !formData.price || !formData.harvestDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      await connect();
      return;
    }

    if (!signer) {
      toast.error('Wallet signer not available');
      return;
    }

    setLoading(true);
    setStep('uploading');

    try {
      // Create FormData for multipart upload
      const postFormData = new FormData();
      postFormData.append('productName', formData.productName);
      postFormData.append('quantity', formData.quantity);
      postFormData.append('price', formData.price);
      postFormData.append('harvestDate', formData.harvestDate);
      postFormData.append('location', JSON.stringify(formData.location));
      postFormData.append('description', formData.description);
      
      // Add images
      images.forEach((image) => {
        postFormData.append('images', image);
      });

      toast.info('Uploading images to IPFS...');
      
      // Step 1: Upload to backend (which handles IPFS)
      const uploadResponse = await apiService.createPost(postFormData);
      
      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || 'Failed to upload');
      }

      const { postId, ipfsHash } = uploadResponse.data.data;

      // Step 2: Create on blockchain
      setStep('blockchain');
      toast.info('Creating product on blockchain...');

      const txHash = await blockchainService.createProduct(postId, ipfsHash, signer);
      
      toast.success('Product created on blockchain!');

      // Step 3: Success
      setStep('success');
      setCreatedPostId(postId);
      setShowQRDialog(true);
      
      toast.success('Product created successfully!');
      
    } catch (error: any) {
      console.error('Create post error:', error);
      toast.error(error.message || 'Failed to create product');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowQRDialog(false);
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold">Create Product Post</h1>
        <p className="text-gray-600 mt-1">Add a new farm product to the marketplace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                name="productName"
                placeholder="e.g., Organic Tomatoes"
                value={formData.productName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Quantity and Price */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per kg (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="50"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Harvest Date */}
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date *</Label>
              <Input
                id="harvestDate"
                name="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>
                <MapPin className="size-4 inline mr-2" />
                Location
              </Label>
              <Input
                name="address"
                placeholder="Farm address"
                value={formData.location.address}
                onChange={handleLocationChange}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="lat"
                  type="number"
                  step="0.000001"
                  placeholder="Latitude"
                  value={formData.location.lat}
                  onChange={handleLocationChange}
                />
                <Input
                  name="lng"
                  type="number"
                  step="0.000001"
                  placeholder="Longitude"
                  value={formData.location.lng}
                  onChange={handleLocationChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Additional details about the product..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>
                <ImageIcon className="size-4 inline mr-2" />
                Product Images *
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Status Indicator */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin text-blue-600" />
                  <div>
                    {step === 'uploading' && <p>Uploading images to IPFS...</p>}
                    {step === 'blockchain' && <p>Creating product on blockchain...</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating Product...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Created Successfully!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-gray-600">Scan this QR code for product traceability</p>
            <div className="flex justify-center">
              <QRCodeSVG
                value={`${window.location.origin}/timeline/${createdPostId}`}
                size={200}
                level="H"
              />
            </div>
            <p className="text-sm text-gray-500">Post ID: {createdPostId}</p>
            <Button onClick={handleCloseDialog} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}