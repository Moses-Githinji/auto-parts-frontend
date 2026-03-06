import { ShieldCheck, TrendingUp, Info } from "lucide-react";
import type { VendorHealth } from "../../types/vendor";
import { VendorHealthBadge } from "./VendorHealthBadge";
import { cn } from "../../lib/cn";

interface VendorHealthCardProps {
  health: VendorHealth;
  className?: string;
}

export function VendorHealthCard({ health, className }: VendorHealthCardProps) {
  const { uiConfig, progression, payoutDays, riskScore } = health;

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface",
      className
    )}>
      {/* Header Section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text">Vendor Health</h3>
            <div className="group relative">
              <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden w-48 rounded-lg bg-slate-900 p-2 text-[10px] text-white group-hover:block z-10 shadow-xl">
                Your health is calculated based on your Dispute-to-Sales Ratio (DSR) in the last 90 days.
                <div className="mt-1 font-medium text-blue-300">Current DSR: {(riskScore * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>
          <VendorHealthBadge uiConfig={uiConfig} />
        </div>

        <div className="space-y-4">
          {/* Payout Information */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Payout Schedule</p>
              <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                {payoutDays === 0 
                  ? "Instant Payouts" 
                  : `Funds held for ${payoutDays} days`}
              </p>
              <p className="text-[10px] text-slate-500">
                {payoutDays === 0 
                  ? "Available immediately upon delivery" 
                  : "Released after security hold period"}
              </p>
            </div>
          </div>

          {/* Progression Tracker */}
          {progression && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <span>Next Tier: {progression.nextBadge}</span>
                <span>{progression.percentComplete}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progression.percentComplete}%`,
                    backgroundColor: uiConfig.color 
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-600 dark:text-dark-textMuted flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Complete {progression.ordersNeeded} more dispute-free sales to upgrade!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description Footer */}
      <div className="bg-slate-50/50 p-3 dark:bg-dark-base border-t border-slate-100 dark:border-dark-border">
        <p className="text-[10px] leading-relaxed text-slate-600 dark:text-dark-textMuted italic">
          "{uiConfig.description}"
        </p>
      </div>
    </div>
  );
}
