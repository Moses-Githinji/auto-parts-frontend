import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useSearchParams } from "react-router-dom";
import { useTrackingStore } from "../../stores/trackingStore";
import { ShipmentStatusUpdate } from "../../components/tracking/ShipmentStatusUpdate";
import { parseQRCodeData } from "../../lib/trackingService";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { DELIVERY_MENU_ITEMS } from "../../layout/deliveryMenuConfig";

export function QRScannerPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id");
  
  const { fetchTrackingInfo, trackingInfo, clearTrackingInfo, isLoadingTracking } = useTrackingStore();
  const [scannedId, setScannedId] = useState<string | null>(initialId);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // If ID provided in URL, load it immediately
    if (initialId) {
      handleScanSuccess(initialId);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      clearTrackingInfo();
    };
  }, [initialId]);

  useEffect(() => {
    // Initialize scanner only if no ID is selected yet
    if (!scannedId && !trackingInfo) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );
      
      scanner.render(
        (decodedText) => {
          const parsed = parseQRCodeData(decodedText);
          if (parsed?.trackingId) {
            handleScanSuccess(parsed.trackingId);
            scanner.clear().catch(console.error);
          } else {
             handleScanSuccess(decodedText);
             scanner.clear().catch(console.error);
          }
        },
        () => {
          // ignore scan errors as they happen frequently while searching
        }
      );
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
         // Cleanup handled in parent effect or manually
      }
    };
  }, [scannedId, trackingInfo]);

  const handleScanSuccess = async (id: string) => {
    setScannedId(id);
    await fetchTrackingInfo(id);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const id = formData.get("manualId") as string;
    if (id) handleScanSuccess(id);
  };

  const resetScan = () => {
    setScannedId(null);
    clearTrackingInfo();
  };

  return (
    <BackofficeLayout title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Scan Parcel
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Scan QR codes to update delivery status.
          </p>
        </div>

        {!scannedId && (
          <div className="space-y-6">
            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
              <div id="reader" className="w-full"></div>
              <p className="text-center text-xs text-slate-500 dark:text-dark-textMuted mt-2">
                Point camera at the QR code on the shipping label
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#c8c8c8] dark:border-dark-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-dark-bgLight text-slate-500 dark:text-dark-textMuted">Or enter manually</span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                name="manualId"
                type="text"
                placeholder="Enter Tracking ID (e.g. TRK-123...)"
                className="flex-1 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none placeholder:text-slate-400 dark:placeholder:text-dark-textMuted"
              />
              <button
                type="submit"
                className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {isLoadingTracking && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2b579a] border-t-transparent"></div>
            <p className="ml-3 text-xs text-slate-600 dark:text-dark-textMuted">Fetching shipment details...</p>
          </div>
        )}

        {trackingInfo && (
          <ShipmentStatusUpdate 
            trackingId={trackingInfo.trackingId}
            currentStatus={trackingInfo.currentStatus}
            onClose={resetScan}
          />
        )}
        
        {!isLoadingTracking && scannedId && !trackingInfo && (
          <div className="rounded-sm border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-center">
            <p className="text-sm text-red-700 dark:text-red-400 mb-2">
              Could not find tracking info for ID: {scannedId}
            </p>
            <button 
              onClick={resetScan}
              className="rounded-sm border border-red-200 dark:border-red-800 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
