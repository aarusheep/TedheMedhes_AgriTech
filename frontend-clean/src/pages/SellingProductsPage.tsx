import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui';
import apiService from '../services/api.service';

export function SellingProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadSelling();
  }, []);

  const loadSelling = async () => {
    const res = await apiService.getSellingPosts();
    setProducts(res.data.data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Selling Products</h1>

      {products.map((post) => (
        <Card key={post.postId}>
          <CardHeader>
            <CardTitle>{post.productName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p>Post ID: {post.postId}</p>
            <p>Price: ₹{post.price}/kg</p>
            <p>Quantity: {post.quantity} kg</p>
            <p>Status: {post.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
