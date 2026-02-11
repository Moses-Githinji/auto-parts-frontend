import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { AdminSidebar } from "./AdminSidebar";
import { DELIVERY_MENU_ITEMS } from "./deliveryMenuConfig";

export function DeliveryLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect non-riders away from delivery routes
  useEffect(() => {
    if (user && user.role !== "RIDER") {
      // Redirect based on role
      if (user.role === "SYSTEM_ADMIN") {
        navigate("/admin", { replace: true });
      } else if (user.role === "VENDOR") {
        navigate("/vendor", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  // Show loading or redirecting state for non-riders
  if (user && user.role !== "RIDER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f3f3f3] dark:bg-dark-bg">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#c8c8c8] dark:border-dark-border bg-[#f3f3f3] dark:bg-dark-bg">
        <AdminSidebar title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <main className="flex-1 p-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight shadow-sm min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
