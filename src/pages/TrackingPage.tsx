import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PDFDownloadLink,
  Document as DocumentComponent,
} from "@react-pdf/renderer";
import { useTrackingStore } from "../stores/trackingStore";
import { STATUS_CONFIG, type ShipmentStatus } from "../types/tracking";
import { Button } from "../components/ui/button";
import { InvoicePDF } from "../components/pdf/OrderDocuments";
import type { Order } from "../types/order";

// Progress steps matching the spec
const PROGRESS_STEPS = [
  {
    status: "ORDER_PLACED",
    label: "Order Placed",
    description: "Payment confirmed",
  },
  {
    status: "PROCESSING",
    label: "Processing",
    description: "Vendor is picking the part",
  },
  {
    status: "IN_TRANSIT",
    label: "In Transit",
    description: "Driver has scanned QR code",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Part is in your local area",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    description: "Successfully handed over",
  },
];

export function TrackingPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const navigate = useNavigate();
  const {
    trackingInfo,
    isLoadingTracking,
    trackingError,
    fetchTrackingInfo,
    clearTrackingInfo,
  } = useTrackingStore();

  const [searchId, setSearchId] = useState(trackingId || "");
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (trackingId) {
      fetchTrackingInfo(trackingId);
      // Also fetch order details for the PDF downloads
      fetchOrderDetails(trackingId);
    }
    return () => {
      clearTrackingInfo();
    };
  }, [trackingId, fetchTrackingInfo, clearTrackingInfo]);

  const fetchOrderDetails = async (trackingId: string) => {
    try {
      const response = await fetch(`/api/scan/${trackingId}/order`);
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setOrderDetails(data.order);
        } catch {
          // API not returning JSON, skip order details
        }
      }
    } catch {
      // Network error, skip order details
    }
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      navigate(`/tracking/${searchId.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCurrentStepIndex = (): number => {
    if (!trackingInfo) return 0;
    const statusMap: Record<ShipmentStatus, number> = {
      PENDING: 0,
      PICKED_UP: 1,
      IN_TRANSIT: 2,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
      FAILED: 3,
      RETURNED: 2,
      CANCELLED: 0,
    };
    return statusMap[trackingInfo.currentStatus] ?? 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getEstimatedDelivery = (): string => {
    const now = new Date();
    const evening = new Date(now);
    evening.setHours(17, 0, 0, 0);

    if (now < evening) {
      return `Expected by ${evening.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} today`;
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return `Expected by ${tomorrow.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} tomorrow`;
  };

  if (isLoadingTracking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-textMuted">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (trackingError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tracking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {trackingError ||
              "We could not find tracking information for this ID."}
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter tracking ID (e.g., TRK-882-X91)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded border border-gray-300 dark:border-dark-border px-4 py-2 text-sm focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            />
            <Button onClick={handleSearch} className="bg-[#FF9900] text-white">
              Track
            </Button>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-[#FF9900] hover:underline text-sm"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Track Your Shipment
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your tracking ID to see the current status of your shipment.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter tracking ID (e.g., TRK-882-X91)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded border border-gray-300 dark:border-dark-border px-4 py-2 text-sm focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            />
            <Button onClick={handleSearch} className="bg-[#FF9900] text-white">
              Track
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusConfig = STATUS_CONFIG[trackingInfo.currentStatus];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Tracking ID</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                {trackingInfo.trackingId}
              </h1>
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(trackingInfo.trackingId)
              }
              className="text-sm text-[#FF9900] hover:underline"
            >
              Copy
            </button>
          </div>

          {/* Current Status Badge */}
          {currentStatusConfig && (
            <div
              className="flex items-center gap-4 p-4 rounded-lg mb-4"
              style={{ backgroundColor: `${currentStatusConfig.color}15` }}
            >
              <span className="text-4xl">{currentStatusConfig.icon}</span>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p
                  className="text-xl font-semibold"
                  style={{ color: currentStatusConfig.color }}
                >
                  {trackingInfo.currentStatus.replace(/_/g, " ")}
                </p>
                {trackingInfo.currentStatus !== "DELIVERED" && (
                  <p className="text-sm text-gray-600 mt-1">
                    {getEstimatedDelivery()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Visual Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {PROGRESS_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={step.status}
                    className="flex flex-col items-center flex-1 relative"
                  >
                    {/* Connector line */}
                    {index > 0 && (
                      <div
                        className={`absolute left-0 right-1/2 h-1 top-5 ${
                          isCompleted ? "bg-[#FF9900]" : "bg-gray-200"
                        }`}
                        style={{ width: "calc(100% - 40px)" }}
                      />
                    )}

                    {/* Step circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                        isCompleted
                          ? "bg-[#FF9900] text-white"
                          : isCurrent
                            ? "bg-white border-2 border-[#FF9900] text-[#FF9900]"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>

                    {/* Step label */}
                    <p
                      className={`text-xs mt-2 text-center ${
                        isCurrent || isCompleted
                          ? "text-gray-900 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Order Summary & Documents */}
          <div className="md:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Live Location
              </h2>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-dark-textMuted text-sm">
                    {trackingInfo.scanHistory.length > 0
                      ? "Map view with last scan location"
                      : "Location will appear after first scan"}
                  </p>
                  {(trackingInfo.currentStatus === "OUT_FOR_DELIVERY" ||
                    trackingInfo.currentStatus === "DELIVERED") && (
                    <p className="text-[#FF9900] text-sm mt-2 font-medium">
                      Driver contact available at delivery
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-dark-text">
                      {trackingInfo.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Customer: {trackingInfo.customerName}
                    </p>
                  </div>
                </div>

                {/* Order Items (if available) */}
                {orderDetails?.items && orderDetails.items.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    {orderDetails.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 dark:bg-dark-bg rounded flex items-center justify-center">
                            <span className="text-lg">🔩</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                              {item.product?.name || "Auto Part"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">
                          KSh {Number(item.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tracking History
              </h2>

              {trackingInfo.scanHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-dark-textMuted text-center py-8">
                  No scan events yet.
                </p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {trackingInfo.scanHistory.map((event, index) => {
                      const eventConfig =
                        STATUS_CONFIG[event.status as ShipmentStatus];
                      const isFirst = index === 0;

                      return (
                        <div key={index} className="relative flex gap-4">
                          {/* Timeline dot */}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                              isFirst ? "ring-4 ring-offset-2" : ""
                            }`}
                            style={{
                              backgroundColor: eventConfig?.color || "#6b7280",
                              color: "white",
                            }}
                          >
                            {eventConfig?.icon || "📍"}
                          </div>

                          {/* Event content */}
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-dark-text">
                                  {event.status.replace(/_/g, " ")}
                                </p>
                                {event.notes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {event.notes}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Documents & Actions */}
          <div className="space-y-6">
            {/* Estimated Delivery */}
            {trackingInfo.currentStatus !== "DELIVERED" && (
              <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-dark-textMuted mb-2">
                  Estimated Delivery
                </h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {getEstimatedDelivery()}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-textMuted mt-1">
                  You'll receive a notification once out for delivery
                </p>
              </div>
            )}

            {/* Documents */}
            {orderDetails &&
              trackingInfo.currentStatus === "DELIVERED" &&
              orderDetails.paymentStatus === "PAID" && (
                <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Documents
                  </h3>
                  <div className="space-y-3">
                    {PDFDownloadLink && (
                      <PDFDownloadLink
                        document={
                          <DeliveryNotePDF
                            order={orderDetails}
                            trackingId={trackingInfo.trackingId}
                          />
                        }
                        fileName={`delivery-note-${orderDetails.orderNumber}.pdf`}
                        className="w-full"
                      >
                        {({ loading }) => (
                          <Button
                            variant="outline"
                            className="w-full justify-start border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900]/10"
                            disabled={loading}
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {loading
                              ? "Preparing..."
                              : "Download Delivery Note"}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}

                    <PDFDownloadLink
                      document={<InvoicePDF order={orderDetails} />}
                      fileName={`invoice-${orderDetails.orderNumber}.pdf`}
                      className="w-full"
                    >
                      {({ loading }) => (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled={loading}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                          {loading ? "Preparing..." : "Print Invoice (eTIMS)"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              )}

            {/* Help & Support */}
            <div className="bg-white dark:bg-dark-bgLight rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => navigate("/account/orders")}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Report an Issue
                </Button>

                {trackingInfo.currentStatus === "DELIVERED" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/account/orders")}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Review Vendor
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open(
                      `mailto:support@autopartsstore.co.ke?subject=Tracking Inquiry - ${trackingInfo.trackingId}`,
                      "_blank"
                    )
                  }
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Share Tracking */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                navigator.share?.({
                  title: `Tracking ${trackingInfo.trackingId}`,
                  url: window.location.href,
                })
              }
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share Tracking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Delivery Note PDF component
const DeliveryNotePDF = ({
  order,
  trackingId,
}: {
  order: Order;
  trackingId: string;
}) => (
  <DocumentComponent>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Delivery Note</h1>
      <div className="mb-6">
        <p>
          <strong>Order Number:</strong> {order.orderNumber}
        </p>
        <p>
          <strong>Tracking ID:</strong> {trackingId}
        </p>
        <p>
          <strong>Date:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Delivery Address</h2>
        <p>
          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
        </p>
        <p>{order.shippingAddress.street}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.zipCode}
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b">
            <span>
              {item.product?.name || "Auto Part"} (Qty: {item.quantity})
            </span>
            <span>KSh {Number(item.price).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  </DocumentComponent>
);
