import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar, type MenuItem } from "./AdminSidebar";

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

  // Use new menuItems if provided, otherwise fallback to legacy format
  const displayMenuItems =
    menuItems || (navItems ? convertLegacyNavItems(navItems) : []);

  return (
    <div className="flex min-h-screen bg-[#f3f3f3] dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-[#c8c8c8] dark:border-dark-border bg-[#f3f3f3] dark:bg-dark-bg md:block">
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-4 shadow-sm md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-dark-textMuted dark:hover:text-dark-text"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-slate-900 dark:text-dark-text">{title}</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight shadow-sm min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
