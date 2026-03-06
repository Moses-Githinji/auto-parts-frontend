import { useState, useEffect } from "react";
import { Menu, X, Bell, AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar, type MenuItem } from "./AdminSidebar";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router-dom";

interface BackofficeLayoutProps {
  children: React.ReactNode;
  title: string;
  // Legacy format - will be converted to new format
  navItems?: { label: string; to: string; icon?: React.ReactNode }[];
  // New format - supports nested routes
  menuItems?: MenuItem[];
}

// Helper function to convert legacy navItems to new format
function convertLegacyNavItems(
  navItems: { label: string; to: string; icon?: React.ReactNode }[]
): MenuItem[] {
  return navItems.map((item) => ({
    title: item.label,
    path: item.to,
    icon: item.icon,
  }));
}

export function BackofficeLayout({
  children,
  title,
  navItems,
  menuItems,
}: BackofficeLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { user } = useAuthStore();
  const { vendorNotifications = [], fetchVendorNotifications, markAsRead } = useNotificationStore();
  const unreadCount = Array.isArray(vendorNotifications) 
    ? vendorNotifications.filter(n => !n.read).length 
    : 0;

  // Polling logic for vendor notifications
  useEffect(() => {
    if (user?.role === "VENDOR") {
      fetchVendorNotifications();
      const interval = setInterval(() => {
        fetchVendorNotifications();
      }, 60000); // Poll every 60 seconds

      return () => clearInterval(interval);
    }
  }, [fetchVendorNotifications, user?.role]);

  // Use new menuItems if provided, otherwise fallback to legacy format
  const displayMenuItems =
    menuItems || (navItems ? convertLegacyNavItems(navItems) : []);

  return (
    <div className="flex min-h-screen bg-[#f3f3f3] dark:bg-dark-base">
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-[#c8c8c8] dark:border-dark-border bg-[#f3f3f3] dark:bg-dark-base md:block">
        <AdminSidebar title={title} menuItems={displayMenuItems} />
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
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#f3f3f3] dark:bg-dark-base shadow-xl md:hidden"
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
                  <AdminSidebar title={title} menuItems={displayMenuItems} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface px-4 shadow-sm md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-dark-textMuted dark:hover:text-dark-text"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="flex-1 font-semibold text-slate-900 dark:text-dark-text">{title}</span>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-dark-textMuted dark:hover:text-dark-text"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 z-50 w-80 rounded-md border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface shadow-lg overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-dark-base px-4 py-2 border-b border-[#c8c8c8] dark:border-dark-border flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-900 dark:text-dark-text">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {vendorNotifications.length > 0 ? (
                        vendorNotifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-4 border-b border-slate-50 dark:border-dark-border last:border-0 hover:bg-slate-50 dark:hover:bg-dark-base transition-colors ${!n.read ? 'bg-sky-50/30' : ''}`}
                            onClick={() => {
                              if (!n.read) markAsRead(n.id);
                              if (n.actionUrl && n.actionUrl.startsWith('/')) {
                                setIsNotificationsOpen(false);
                              }
                            }}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${n.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
                                {n.type === 'WARNING' ? <AlertTriangle className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-dark-text truncate">{n.title}</p>
                                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-dark-textMuted line-clamp-2">{n.message}</p>
                                {n.actionUrl && (
                                  <Link 
                                    to={n.actionUrl}
                                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 hover:text-sky-700"
                                  >
                                    Take Action <ExternalLink className="h-2.5 w-2.5" />
                                  </Link>
                                )}
                                <p className="mt-1 text-[9px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                          <p className="text-sm text-slate-500">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
