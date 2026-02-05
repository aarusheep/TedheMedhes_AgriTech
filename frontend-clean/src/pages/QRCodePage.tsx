import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/ui';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function QRCodePage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const timelineUrl = `${window.location.origin}/timeline/${postId}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `product-qr-${postId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR code downloaded');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Product Traceability',
          text: 'Scan this QR code to view the complete product journey',
          url: timelineUrl,
        });
        toast.success('Shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(timelineUrl);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Product QR Code</CardTitle>
          <p className="text-gray-600 mt-2">
            Scan this code to view complete product traceability
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <QRCodeSVG
              id="qr-code"
              value={timelineUrl}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Product ID */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Product ID</p>
            <p className="font-mono font-medium text-lg mt-1">{postId}</p>
          </div>

          {/* URL */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Timeline URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white p-2 rounded border overflow-x-auto">
                {timelineUrl}
              </code>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
              <li>Print this QR code on product packaging</li>
              <li>Consumers can scan it to view the complete journey</li>
              <li>All transfers and ownership changes are tracked on blockchain</li>
              <li>Ensures transparency and builds trust</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="size-4 mr-2" />
              Share
            </Button>
          </div>

          <Button
            onClick={() => navigate(`/timeline/${postId}`)}
            className="w-full"
          >
            View Timeline
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}