import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";
import { useAuthStore } from "../stores/authStore";

interface BackofficeLayoutProps {
  children: React.ReactNode;
  title: string;
  navItems: { label: string; to: string; icon?: React.ReactNode }[];
}

export function BackofficeLayout({
  children,
  title,
  navItems,
}: BackofficeLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f3f3f3]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#c8c8c8] bg-[#f3f3f3]">
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
              <p className="truncate text-[10px] text-slate-600">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs",
                      isActive
                        ? "bg-[#2b579a] text-white"
                        : "text-slate-700 hover:bg-[#e8e8e8]",
                    )
                  }
                  end={item.to === "/"}
                >
                  {item.icon && (
                    <span className="flex h-4 w-4 items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
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
