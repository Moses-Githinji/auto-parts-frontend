import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

type RibbonTab = {
  label: string;
  to: string;
  matchPrefix?: string;
  icon?: React.ReactNode;
};

interface RibbonTabsProps {
  tabs: RibbonTab[];
  title?: string;
  children?: React.ReactNode;
}

export function RibbonTabs({ tabs, title, children }: RibbonTabsProps) {
  return (
    <div className="bg-[#f3f3f3] min-h-screen">
      {/* Word-style title bar */}
      <header className="flex items-center gap-2 border-b border-[#c8c8c8] bg-[#f3f3f3] px-2 py-1">
        {/* Word-like icon/logo */}
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-xs">
          W
        </div>
        {/* App title */}
        {title && (
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        )}
        {/* File menu button */}
        <button className="ml-2 rounded-sm px-3 py-1 text-xs font-medium text-slate-700 hover:bg-[#e8e8e8]">
          File
        </button>
      </header>

      {/* Word-style ribbon */}
      <nav className="flex flex-col border-b border-[#c8c8c8] bg-[#f3f3f3]">
        {/* Tab row */}
        <div className="flex items-center gap-0 px-2 pt-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-1 rounded-t-md border border-transparent px-3 py-1.5 text-xs font-medium text-slate-600",
                  isActive
                    ? "bg-white border border-[#c8c8c8] border-b-transparent text-slate-900"
                    : "hover:bg-[#e8e8e8]",
                )
              }
              end={tab.to === "/"}
            >
              {({ isActive }) => (
                <>
                  {tab.icon && (
                    <span className="flex h-4 w-4 items-center justify-center opacity-70">
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="ribbon-tab-underline"
                      className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[#2b579a]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Ribbon content area */}
        <div className="flex items-center gap-4 border-t border-[#c8c8c8] bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Home</span>
            <span className="h-4 w-px bg-[#c8c8c8]" />
            <span className="cursor-pointer hover:text-slate-700">
              Clipboard
            </span>
            <span className="cursor-pointer hover:text-slate-700">Font</span>
            <span className="cursor-pointer hover:text-slate-700">
              Paragraph
            </span>
            <span className="cursor-pointer hover:text-slate-700">Styles</span>
          </div>
        </div>
      </nav>

      {/* Content area */}
      <div className="p-4">
        <div className="rounded-sm border border-[#c8c8c8] bg-white shadow-sm min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
