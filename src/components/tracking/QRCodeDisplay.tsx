import { useState } from "react";
import { Button } from "../ui/button";

interface QRCodeDisplayProps {
  qrCodeDataUri: string;
  trackingId: string;
  trackingUrl: string;
  onClose?: () => void;
}

export function QRCodeDisplay({
  qrCodeDataUri,
  trackingId,
  trackingUrl,
  onClose,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeDataUri;
    link.download = `tracking-${trackingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tracking QR - ${trackingId}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              img {
                max-width: 300px;
                margin-bottom: 20px;
              }
              .tracking-id {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .tracking-url {
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <img src="${qrCodeDataUri}" alt="Tracking QR Code" />
            <div class="tracking-id">${trackingId}</div>
            <div class="tracking-url">${trackingUrl}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Tracking QR Code
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex justify-center mb-4">
          <img
            src={qrCodeDataUri}
            alt={`Tracking QR Code for ${trackingId}`}
            className="w-48 h-48 border rounded-lg"
          />
        </div>

        <div className="text-center mb-4">
          <p className="font-mono text-lg font-bold text-gray-900">
            {trackingId}
          </p>
          <p className="text-sm text-gray-500 break-all">{trackingUrl}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopyUrl}
            className="flex-1 border-gray-300"
          >
            {copied ? "Copied!" : "Copy URL"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1 border-gray-300"
          >
            Download
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 bg-[#2b579a] text-white"
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
