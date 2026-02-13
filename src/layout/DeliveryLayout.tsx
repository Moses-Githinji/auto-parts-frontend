import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { AdminSidebar } from "./AdminSidebar";
import { DELIVERY_MENU_ITEMS } from "./deliveryMenuConfig";

export function DeliveryLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-[#c8c8c8] dark:border-dark-border bg-[#f3f3f3] dark:bg-dark-bg md:block">
        <AdminSidebar title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS} />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#f3f3f3] dark:bg-dark-bg shadow-xl md:hidden"
            >
              <div className="h-full flex flex-col">
                <div className="flex justify-end p-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-dark-textMuted dark:hover:text-dark-text"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <AdminSidebar title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-4 shadow-sm md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-dark-textMuted dark:hover:text-dark-text"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-slate-900 dark:text-dark-text">Delivery Portal</span>
        </header>

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
