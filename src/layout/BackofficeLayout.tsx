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
    <div className="flex min-h-screen bg-[#f3f3f3]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#c8c8c8] bg-[#f3f3f3]">
        <AdminSidebar title={title} menuItems={displayMenuItems} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        {/* <header className="flex h-12 items-center justify-between border-b border-[#c8c8c8] bg-white px-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="rounded-sm px-3 py-1 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]">
              File
            </button>
            <button className="rounded-sm px-3 py-1 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]">
              Home
            </button>
            <button className="rounded-sm px-3 py-1 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]">
              Insert
            </button>
            <button className="rounded-sm px-3 py-1 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]">
              Layout
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </header> */}

        {/* Content */}
        <main className="flex-1 p-4">
          <div className="rounded-sm border border-[#c8c8c8] bg-white shadow-sm min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
