import { useState } from "react";
import { cn } from "../../lib/cn";

interface VendorEarningsDisplayProps {
  orderAmount: number;
  commissionRate?: number;
  marketplaceFee: number;
  vatAmount: number;
  vendorPayout: number;
  isCollapsible?: boolean;
  className?: string;
}

export function VendorEarningsDisplay({
  orderAmount,
  commissionRate,
  marketplaceFee,
  vatAmount,
  vendorPayout,
  isCollapsible = true,
  className,
}: VendorEarningsDisplayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatCurrency = (value: number) => {
    return `KSh ${value.toLocaleString()}`;
  };

  if (isCollapsible) {
    return (
      <div className={cn("rounded-sm border border-[#e8e8e8]", className)}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between bg-slate-50 px-4 py-2 text-left"
        >
          <span className="text-sm font-medium text-slate-900">
            Earnings Breakdown
          </span>
          <svg
            className={cn(
              "h-4 w-4 text-slate-500 transition-transform",
              isCollapsed && "rotate-180"
            )}
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
        </button>

        {!isCollapsed && (
          <div className="border-t border-[#e8e8e8] bg-white p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Order Amount</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(orderAmount)}
                </span>
              </div>
              <div className="border-t border-[#e8e8e8] pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Marketplace Fee
                    {commissionRate !== undefined && ` (${commissionRate}%)`}
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(marketplaceFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">VAT (16% on fee)</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(vatAmount)}
                  </span>
                </div>
              </div>
              <div className="border-t-2 border-[#c8c8c8] pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">
                    Total Deductions
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(marketplaceFee + vatAmount)}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#c8c8c8] pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-green-700">
                    Your Payout
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(vendorPayout)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Non-collapsible version
  return (
    <div
      className={cn(
        "rounded-sm border border-[#e8e8e8] bg-white p-4",
        className
      )}
    >
      <h4 className="mb-3 text-sm font-semibold text-slate-900">
        Earnings Breakdown
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Order Amount</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(orderAmount)}
          </span>
        </div>
        <div className="border-t border-[#e8e8e8] pt-2">
          <div className="flex justify-between">
            <span className="text-slate-600">
              Marketplace Fee
              {commissionRate !== undefined && ` (${commissionRate}%)`}
            </span>
            <span className="font-medium text-slate-900">
              {formatCurrency(marketplaceFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">VAT (16% on fee)</span>
            <span className="font-medium text-slate-900">
              {formatCurrency(vatAmount)}
            </span>
          </div>
        </div>
        <div className="border-t-2 border-[#c8c8c8] pt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700">
              Total Deductions
            </span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(marketplaceFee + vatAmount)}
            </span>
          </div>
        </div>
        <div className="border-t border-[#c8c8c8] pt-2">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-green-700">
              Your Payout
            </span>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(vendorPayout)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
