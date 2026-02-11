import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import type { Order, OrderStatus } from "../../types/order";
import {
  InvoicePDF,
  PackingSlipPDF,
  ShippingLabelPDF,
} from "../../components/pdf/OrderDocuments";
import { generateTracking } from "../../lib/trackingService";
import type { GenerateTrackingResponse } from "../../types/tracking";

interface ProcessOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (
    orderId: string,
    status: OrderStatus,
    data?: Record<string, unknown>
  ) => Promise<void>;
}

interface GeneratedTracking {
  trackingId: string;
  qrCodeDataUri: string;
  trackingUrl: string;
}

type Step = "confirm" | "documents" | "shipping" | "handover";

const couriers = [
  { id: "g4s", name: "G4S" },
  { id: "wells_fargo", name: "Wells Fargo" },
  { id: "sendy", name: "Sendy" },
  { id: "in_house", name: "In-house Rider" },
  { id: "other", name: "Other" },
];

export function ProcessOrderModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
}: ProcessOrderModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("confirm");
  const [confirmedItems, setConfirmedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [dispatchNote, setDispatchNote] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTracking, setGeneratedTracking] =
    useState<GeneratedTracking | null>(null);
  const [isGeneratingTracking, setIsGeneratingTracking] = useState(false);

  // Auto-fill tracking number when generated tracking changes
  useEffect(() => {
    if (generatedTracking?.trackingId && !trackingNumber) {
      setTrackingNumber(generatedTracking.trackingId);
    }
  }, [generatedTracking, trackingNumber]);

  if (!isOpen || !order) return null;

  const allItemsConfirmed = order.items.every(
    (item) => confirmedItems[item.id]
  );

  const handleConfirmStep = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onStatusUpdate(order.id, "CONFIRMED");
      setCurrentStep("documents");
    } catch (err) {
      setError("Failed to confirm order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentsStep = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onStatusUpdate(order.id, "PROCESSING");
      setCurrentStep("shipping");
    } catch (err) {
      setError("Failed to update status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingStep = async () => {
    if (!trackingNumber || !selectedCourier) {
      setError("Please enter tracking number and select a courier.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onStatusUpdate(order.id, "SHIPPED", {
        trackingNumber,
        courier: selectedCourier,
      });
      setCurrentStep("handover");
    } catch (err) {
      setError("Failed to update shipping info. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHandoverStep = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Update order status to OUT_FOR_DELIVERY
      await onStatusUpdate(order.id, "OUT_FOR_DELIVERY", {
        trackingNumber,
        courier: selectedCourier,
        trackingUrl: generatedTracking?.trackingUrl,
        dispatchNote: dispatchNote?.name || null,
      });

      // Email notification is now sent via the backend through the sendOrderNotification API call
      // The vendor dashboard will trigger this automatically
      toast.success(
        `Order is now out for delivery! The customer will receive tracking information at ${order.shippingAddress.email || order.customerEmail}.`
      );

      onClose();
    } catch (err) {
      setError("Failed to complete handover. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateTracking = async () => {
    if (!order) return;
    setIsGeneratingTracking(true);
    setError(null);
    try {
      const result = (await generateTracking(
        order.id
      )) as GenerateTrackingResponse;
      if (result && result.reconciliation) {
        setGeneratedTracking({
          trackingId: result.reconciliation.trackingId,
          qrCodeDataUri: result.reconciliation.qrCodeDataUri,
          trackingUrl: result.reconciliation.trackingUrl,
        });
      }
    } catch (err) {
      setError("Failed to generate tracking. Please try again.");
    } finally {
      setIsGeneratingTracking(false);
    }
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case "confirm":
        return 1;
      case "documents":
        return 2;
      case "shipping":
        return 3;
      case "handover":
        return 4;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {(["confirm", "documents", "shipping", "handover"] as Step[]).map(
        (step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                getStepNumber(step) < getStepNumber(currentStep)
                  ? "bg-green-500 text-white"
                  : getStepNumber(step) === getStepNumber(currentStep)
                    ? "bg-[#2b579a] text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {getStepNumber(step) < getStepNumber(currentStep) ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                getStepNumber(step)
              )}
            </div>
            {index < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  getStepNumber(step) < getStepNumber(currentStep)
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      )}
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
          Step 1: Confirm Availability
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Check that you have each item ready for pickup or shipping.
        </p>
      </div>

      <div className="space-y-3">
        {order.items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={!!confirmedItems[item.id]}
              onChange={(e) =>
                setConfirmedItems((prev) => ({
                  ...prev,
                  [item.id]: e.target.checked,
                }))
              }
              className="w-5 h-5 text-[#2b579a] border-gray-300 rounded focus:ring-[#2b579a]"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-dark-text">
                {item.product?.name || "Unknown Product"}
              </p>
              <p className="text-sm text-slate-500 dark:text-dark-textMuted">
                SKU: {item.product?.partNumber || "N/A"} • Qty: {item.quantity}
              </p>
              {item.product?.specifications?.Volume && (
                <p className="text-xs text-slate-400 mt-1">
                  {item.product.specifications.Volume}
                </p>
              )}
            </div>
            <p className="font-medium text-slate-900 dark:text-dark-text">
              KSh {Number(item.price || 0).toLocaleString()}
            </p>
          </label>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmStep}
          disabled={!allItemsConfirmed || isSubmitting}
          className="px-4 py-2 text-sm bg-[#2b579a] text-white rounded-sm hover:bg-[#1e3f7a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Confirming..." : "Confirm & Continue"}
        </button>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
          Step 2: Prepare Documents
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Generate and download the necessary paperwork for this order.
        </p>
      </div>

      <div className="grid gap-4">
        <PDFDownloadLink
          document={<InvoicePDF order={order} />}
          fileName={`invoice-${order.orderNumber}.pdf`}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {({ loading }) => (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-dark-text">Invoice</p>
                  <p className="text-sm text-slate-500 dark:text-dark-textMuted">
                    {loading ? "Preparing..." : "Download customer invoice"}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-400 dark:text-dark-textMuted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </>
          )}
        </PDFDownloadLink>

        <PDFDownloadLink
          document={<PackingSlipPDF order={order} />}
          fileName={`packing-slip-${order.orderNumber}.pdf`}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {({ loading }) => (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-dark-text">Packing Slip</p>
                  <p className="text-sm text-slate-500 dark:text-dark-textMuted">
                    {loading ? "Preparing..." : "For warehouse picking"}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-400 dark:text-dark-textMuted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </>
          )}
        </PDFDownloadLink>

        <PDFDownloadLink
          document={
            <ShippingLabelPDF
              order={order}
              trackingId={generatedTracking?.trackingId}
              qrCodeDataUri={generatedTracking?.qrCodeDataUri}
              trackingUrl={generatedTracking?.trackingUrl}
              vendor={order.items[0]?.product?.vendor}
            />
          }
          fileName={`shipping-label-${order.orderNumber}.pdf`}
          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
            generatedTracking
              ? "border-green-200 bg-green-50"
              : "border-gray-200"
          }`}
        >
          {({ loading }) => (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-dark-text">Shipping Label</p>
                  <p className="text-sm text-slate-500 dark:text-dark-textMuted">
                    {loading
                      ? "Preparing..."
                      : generatedTracking
                        ? `With QR: ${generatedTracking.trackingId}`
                        : "Print for courier"}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-400 dark:text-dark-textMuted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </>
          )}
        </PDFDownloadLink>

        {/* Generate Tracking Button */}
        {!generatedTracking && (
          <button
            onClick={handleGenerateTracking}
            disabled={isGeneratingTracking}
            className="flex items-center justify-between w-full p-4 border border-dashed border-[#2b579a] rounded-lg hover:bg-blue-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2b579a] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-[#2b579a]">
                  Generate QR Tracking
                </p>
                <p className="text-sm text-slate-500 dark:text-dark-textMuted">
                  {isGeneratingTracking
                    ? "Generating..."
                    : "Create tracking with QR code"}
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleDocumentsStep}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-[#2b579a] text-white rounded-sm hover:bg-[#1e3f7a]"
        >
          {isSubmitting ? "Processing..." : "Mark as Processing"}
        </button>
      </div>
    </div>
  );

  const renderShippingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
          Step 3: Shipping Details
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter the courier and tracking information.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Courier Service *
          </label>
          <select
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
          >
            <option value="">Select courier...</option>
            {couriers.map((courier) => (
              <option key={courier.id} value={courier.id}>
                {courier.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tracking Number *
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-slate-900 mb-2">
            Shipping Address
          </p>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            {order.shippingAddress.street}
          </p>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zipCode}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleShippingStep}
          disabled={isSubmitting || !trackingNumber || !selectedCourier}
          className="px-4 py-2 text-sm bg-[#2b579a] text-white rounded-sm hover:bg-[#1e3f7a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating..." : "Mark as Shipped"}
        </button>
      </div>
    </div>
  );

  const renderHandoverStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
          Step 4: Proof of Handover
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Upload proof of dispatch to protect yourself in case of disputes.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setDispatchNote(e.target.files?.[0] || null)}
          className="hidden"
          id="dispatch-note"
        />
        <label htmlFor="dispatch-note" className="cursor-pointer">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-dark-text">
            {dispatchNote ? dispatchNote.name : "Upload dispatch note or photo"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-dark-textMuted">Supports images and PDF</p>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Skip & Close
        </button>
        <button
          onClick={handleHandoverStep}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-sm hover:bg-green-700"
        >
          {isSubmitting ? "Completing..." : "Complete Handover"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
              Process Order #{order.orderNumber}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStepIndicator()}
            {currentStep === "confirm" && renderConfirmStep()}
            {currentStep === "documents" && renderDocumentsStep()}
            {currentStep === "shipping" && renderShippingStep()}
            {currentStep === "handover" && renderHandoverStep()}
          </div>
        </div>
      </div>
    </>
  );
}
