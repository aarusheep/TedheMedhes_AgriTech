import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from '@/ui';
import apiService from '../services/api.service';
import type { Post } from '@/types';
import { toast } from 'sonner';
import { Loader2, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';

export function RepostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [originalProduct, setOriginalProduct] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    newPrice: '',
    quantity: '',
    description: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (postId) {
      loadOriginalProduct();
    }
  }, [postId]);

  const loadOriginalProduct = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPostById(postId!);
      if (response.data.success) {
        const product = response.data.data;
        setOriginalProduct(product);
        
        // Pre-fill form with original data
        setFormData({
          newPrice: product.price.toString(),
          quantity: product.quantity.toString(),
          description: '',
        });
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/owned-products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!originalProduct) return;

    // Validation
    if (!formData.newPrice || !formData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.quantity) > originalProduct.quantity) {
      toast.error(`Maximum available quantity is ${originalProduct.quantity} kg`);
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for multipart upload
      const repostFormData = new FormData();
      repostFormData.append('originalPostId', postId!);
      repostFormData.append('newPrice', formData.newPrice);
      repostFormData.append('quantity', formData.quantity);
      repostFormData.append('description', formData.description);
      
      // Add images if provided
      images.forEach((image) => {
        repostFormData.append('images', image);
      });

      toast.info('Creating repost listing...');
      
      const response = await apiService.repostProduct(repostFormData);
      
      if (response.data.success) {
        toast.success('Product reposted successfully!');
        navigate('/owned-products');
      } else {
        throw new Error(response.data.message || 'Failed to repost');
      }
      
    } catch (error: any) {
      console.error('Repost error:', error);
      toast.error(error.response?.data?.message || 'Failed to repost product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-start">
        <Loader2 className="size-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!originalProduct) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-gray-600">Product not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold">Repost Product</h1>
        <p className="text-gray-600 mt-1">List this product for resale on the marketplace</p>
      </div>

      {/* Original Product Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Original Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Product Name:</span>
            <span className="font-medium">{originalProduct.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Original Farmer:</span>
            <span className="font-medium">{originalProduct.farmerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Blockchain Post ID:</span>
            <span className="font-medium font-mono text-xs">{originalProduct.postId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Available Quantity:</span>
            <span className="font-medium">{originalProduct.quantity} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Your Purchase Price:</span>
            <span className="font-medium">₹{originalProduct.price}/kg</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repost Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Price and Quantity */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPrice">New Selling Price per kg (₹) *</Label>
                <Input
                  id="newPrice"
                  name="newPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter new price"
                  value={formData.newPrice}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Original: ₹{originalProduct.price}/kg
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Resell (kg) *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Max: {originalProduct.quantity}"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  max={originalProduct.quantity}
                  required
                />
                <p className="text-xs text-gray-500">
                  Available: {originalProduct.quantity} kg
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Additional Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add any additional details about storage, handling, etc..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Images (Optional) */}
            <div className="space-y-2">
              <Label>
                <ImageIcon className="size-4 inline mr-2" />
                Additional Images (Optional)
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500">
                Original product images will be used if no new images are provided
              </p>
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

            {/* Price Calculation */}
            {formData.newPrice && formData.quantity && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Profit Calculation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Your cost:</span>
                    <span>₹{(parseFloat(formData.quantity) * originalProduct.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selling price:</span>
                    <span>₹{(parseFloat(formData.quantity) * parseFloat(formData.newPrice)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>Potential profit:</span>
                    <span className={
                      parseFloat(formData.newPrice) > originalProduct.price
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      ₹{(
                        parseFloat(formData.quantity) * (parseFloat(formData.newPrice) - originalProduct.price)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This repost will use the same blockchain Post ID ({originalProduct.postId}). 
                The ownership transfer history will be maintained on the blockchain for complete traceability.
              </p>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating Repost...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Repost Product
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}