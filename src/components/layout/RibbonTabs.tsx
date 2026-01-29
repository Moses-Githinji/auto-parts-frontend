import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

type RibbonTab = {
  label: string;
  to: string;
  matchPrefix?: string;
};

interface RibbonTabsProps {
  tabs: RibbonTab[];
}

export function RibbonTabs({ tabs }: RibbonTabsProps) {
  return (
    <nav className="flex items-end gap-1 border-b border-slate-200 px-4 pt-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "relative rounded-t-md px-3 py-1.5 text-sm font-semibold text-slate-600",
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:bg-slate-100",
            )
          }
          end={tab.to === "/"}
        >
          {({ isActive }) => (
            <>
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="ribbon-tab-underline"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-sky-500"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
