import { useState } from "react";
import { Link } from "react-router-dom";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { DELIVERY_MENU_ITEMS } from "../../layout/deliveryMenuConfig";

interface DeliveryTask {
  id: string;
  type: "PICKUP" | "DELIVERY";
  status: "PENDING" | "PICKED_UP" | "IN_TRANSIT";
  address: string;
  customerName: string;
  customerPhone: string;
  lat: number;
  lng: number;
  timeSlot: string;
}

// SVG icon components
const LocationIcon = () => (
  <svg className="h-4 w-4 text-slate-500 dark:text-dark-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MapIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const CameraIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function ActiveDeliveriesPage() {
  // Mock data - in real app this comes from API
  const [tasks] = useState<DeliveryTask[]>([
    {
      id: "DEL-4921",
      type: "PICKUP",
      status: "PENDING",
      address: "AutoParts Warehouse, Industrial Area",
      customerName: "Warehouse Dispatch",
      customerPhone: "+254711000000",
      lat: -1.3005,
      lng: 36.8219,
      timeSlot: "10:00 AM - 11:00 AM",
    },
    {
      id: "DEL-4922",
      type: "DELIVERY",
      status: "IN_TRANSIT",
      address: "Westlands Square, Nairobi",
      customerName: "John Doe",
      customerPhone: "+254722000000",
      lat: -1.2684,
      lng: 36.8122,
      timeSlot: "11:30 AM - 12:30 PM",
    },
    {
      id: "DEL-4925",
      type: "DELIVERY",
      status: "PENDING",
      address: "Karen Country Club",
      customerName: "Jane Smith",
      customerPhone: "+254733000000",
      lat: -1.3345,
      lng: 36.7032,
      timeSlot: "2:00 PM - 3:00 PM",
    },
  ]);

  const openMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "IN_TRANSIT":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "PICKUP"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  return (
    <BackofficeLayout title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Active Tasks
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Manage your current delivery assignments.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-600 dark:text-dark-textMuted">
            {tasks.length} Active
          </span>
        </div>

        {/* Tasks Table */}
        {tasks.length > 0 ? (
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border">
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
                <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Task ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Destination
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Time Slot
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-[#e8e8e8] dark:border-dark-border hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                      {task.id}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTypeBadge(task.type)}`}>
                        {task.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <LocationIcon />
                        <span className="text-slate-700 dark:text-dark-text">{task.address}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 dark:text-dark-text">{task.customerName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">{task.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-dark-text">
                      {task.timeSlot}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${task.customerPhone}`}
                          className="flex items-center gap-1 rounded-sm border border-[#c8c8c8] dark:border-dark-border px-2 py-0.5 text-[10px] text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg"
                          title="Call"
                        >
                          <PhoneIcon />
                          <span>Call</span>
                        </a>
                        <button
                          onClick={() => openMaps(task.lat, task.lng)}
                          className="flex items-center gap-1 rounded-sm border border-[#c8c8c8] dark:border-dark-border px-2 py-0.5 text-[10px] text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg"
                          title="Navigate"
                        >
                          <MapIcon />
                          <span>Navigate</span>
                        </button>
                        <Link
                          to={`/delivery/scan?id=${task.id}`}
                          className="flex items-center gap-1 rounded-sm bg-[#2b579a] px-2 py-0.5 text-[10px] text-white hover:bg-[#1e3f7a]"
                          title="Update Status"
                        >
                          <CameraIcon />
                          <span>Update</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-dark-bgLight">
              <svg className="h-8 w-8 text-slate-400 dark:text-dark-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-dark-text">No active tasks</h3>
            <p className="mb-4 text-xs text-slate-500 dark:text-dark-textMuted">
              No delivery assignments at the moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
