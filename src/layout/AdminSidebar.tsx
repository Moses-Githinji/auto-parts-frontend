import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";
import { useAuthStore } from "../stores/authStore";

export interface MenuItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface AdminSidebarProps {
  title: string;
  menuItems: MenuItem[];
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-4 w-4 transition-transform", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const SidebarItem = ({
  item,
  depth = 0,
}: {
  item: MenuItem;
  depth?: number;
}) => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Check if this item or any of its children is currently active
  const isActive = item.path ? pathname === item.path : false;
  const hasActiveChild =
    hasChildren && item.children?.some((child) => pathname === child.path);

  // Auto-expand parent if any child is active (useEffect to avoid re-render loops)
  useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveChild, isOpen]);

  // Set initial open state based on active child
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, []);

  return (
    <div className="w-full">
      {hasChildren ? (
        // Expandable Parent
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-xs transition-colors",
            hasActiveChild || isActive
              ? "bg-[#2b579a] text-white"
              : "text-slate-700 hover:bg-[#e8e8e8]"
          )}
        >
          <div className="flex items-center gap-2">
            {item.icon && (
              <span className="flex h-4 w-4 items-center justify-center">
                {item.icon}
              </span>
            )}
            <span>{item.title}</span>
          </div>
          <ChevronDownIcon className={cn(isOpen && "rotate-180", "h-3 w-3")} />
        </button>
      ) : (
        // Single Link
        <NavLink
          to={item.path || "#"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs transition-colors",
              isActive
                ? "bg-[#2b579a] text-white"
                : "text-slate-700 hover:bg-[#e8e8e8]"
            )
          }
          end={item.path === "/"}
        >
          {item.icon && (
            <span className="flex h-4 w-4 items-center justify-center">
              {item.icon}
            </span>
          )}
          <span>{item.title}</span>
        </NavLink>
      )}

      {/* Nested Children */}
      {hasChildren && isOpen && (
        <div
          className={cn(
            "mt-0.5 flex flex-col gap-0.5 border-l border-[#c8c8c8]",
            depth > 0 ? "ml-3" : "ml-3"
          )}
        >
          {item.children?.map((child) => (
            <SidebarItem key={child.path} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function AdminSidebar({ title, menuItems }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div className="flex h-12 items-center gap-2 border-b border-[#c8c8c8] bg-[#e8e8e8] px-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold">
          W
        </div>
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>

      {/* User info */}
      <div className="border-b border-[#c8c8c8] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700">
            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-slate-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[10px] text-slate-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-0.5">
          {menuItems.map((item) => (
            <SidebarItem key={item.path || item.title} item={item} />
          ))}
        </div>
      </nav>

      {/* Logout button */}
      <div className="border-t border-[#c8c8c8] p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-xs text-slate-700 hover:bg-[#e8e8e8]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
