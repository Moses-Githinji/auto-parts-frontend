import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useTrackingStore } from "../../stores/trackingStore";
import { STATUS_CONFIG, type ShipmentStatus } from "../../types/tracking";
import { getAllowedNextStatuses } from "../../lib/trackingService";

interface ShipmentStatusUpdateProps {
  trackingId: string;
  currentStatus: ShipmentStatus;
  onClose?: () => void;
}

export function ShipmentStatusUpdate({
  trackingId,
  currentStatus,
  onClose,
}: ShipmentStatusUpdateProps) {
  const { updateStatus, isUpdatingStatus, clearErrors } = useTrackingStore();

  const [status, setStatus] = useState<ShipmentStatus>("" as ShipmentStatus);
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const allowedStatuses = getAllowedNextStatuses(currentStatus);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (err) => {
          console.warn("Could not get location:", err);
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearErrors();

    if (!status) {
      setError("Please select a status");
      return;
    }

    const success = await updateStatus({
      trackingId,
      status,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      notes: notes || undefined,
    });

    if (success && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Shipment Status
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

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Tracking ID</p>
          <p className="font-mono font-bold text-gray-900">{trackingId}</p>
          <p className="text-sm text-gray-500 mt-2">Current Status</p>
          <p className="font-medium text-gray-900">
            {STATUS_CONFIG[currentStatus]?.icon}{" "}
            {currentStatus.replace(/_/g, " ")}
          </p>
        </div>

        {allowedStatuses.length === 0 ? (
          <div className="p-4 bg-amber-50 text-amber-700 rounded-lg mb-4">
            <p className="font-medium">No further status updates allowed</p>
            <p className="text-sm">
              This shipment has reached a terminal state.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2b579a] focus:outline-none focus:ring-1 focus:ring-[#2b579a]"
                required
              >
                <option value="">Select status...</option>
                {allowedStatuses.map((s: string) => {
                  const config = STATUS_CONFIG[s as ShipmentStatus];
                  return (
                    <option key={s} value={s}>
                      {config?.icon} {s.replace(/_/g, " ")}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value as number | "")}
                    placeholder="e.g., -1.286"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2b579a] focus:outline-none focus:ring-1 focus:ring-[#2b579a]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value as number | "")}
                    placeholder="e.g., 36.817"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2b579a] focus:outline-none focus:ring-1 focus:ring-[#2b579a]"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this status update..."
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2b579a] focus:outline-none focus:ring-1 focus:ring-[#2b579a]"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingStatus || !status}
                className="flex-1 bg-[#2b579a] text-white"
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
