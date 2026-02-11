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
  // Use new menuItems if provided, otherwise fallback to legacy format
  const displayMenuItems =
    menuItems || (navItems ? convertLegacyNavItems(navItems) : []);

  return (
    <div className="flex min-h-screen bg-[#f3f3f3] dark:bg-dark-bg">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#c8c8c8] dark:border-dark-border bg-[#f3f3f3] dark:bg-dark-bg">
        <AdminSidebar title={title} menuItems={displayMenuItems} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header - keeping commented as in original */}
        {/* <header className="flex h-12 items-center justify-between border-b border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-4 shadow-sm">
          ...
        </header> */}

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
