import { useEffect } from "react";
import { useCommissionStore } from "../../stores/commissionStore";
import { CommissionRulesLegend } from "./CommissionRulesLegend.tsx";
import { cn } from "../../lib/cn";

interface FeePreviewProps {
  price: number;
  categorySlug: string;
  categoryName?: string;
  onFeeCalculated?: (
    fee: import("../../types/commission").FeeCalculationResponse
  ) => void;
  showLegend?: boolean;
  className?: string;
}

export function FeePreview({
  price,
  categorySlug,
  onFeeCalculated,
  showLegend = true,
  className,
}: FeePreviewProps) {
  const {
    feePreview,
    isCalculatingFees,
    feeError,
    calculateFees,
    clearFeePreview,
  } = useCommissionStore();

  // Debounced calculation
  useEffect(() => {
    if (price > 0 && categorySlug) {
      const timer = setTimeout(() => {
        calculateFees(price, categorySlug);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      clearFeePreview();
    }
  }, [price, categorySlug, calculateFees, clearFeePreview]);

  // Notify parent when fee is calculated
  useEffect(() => {
    if (feePreview && onFeeCalculated) {
      onFeeCalculated(feePreview);
    }
  }, [feePreview, onFeeCalculated]);

  // Don't show if no price or category
  if (price <= 0 || !categorySlug) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-sm border border-[#e8e8e8] bg-slate-50 p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">Fee Preview</h4>
        {isCalculatingFees && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <svg
              className="h-3 w-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5-.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            Calculating...
          </span>
        )}
      </div>

      {feeError && (
        <div className="mb-3 rounded-sm bg-amber-50 p-2 text-xs text-amber-600">
          {feeError}
        </div>
      )}

      {feePreview && !isCalculatingFees && (
        <>
          {/* Fee Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Order Amount</span>
              <span className="font-medium text-slate-900">
                KSh {feePreview.price.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[#c8c8c8] pt-2">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Marketplace Fee ({feePreview.commissionRate}%)
                </span>
                <span className="font-medium text-slate-900">
                  KSh {feePreview.breakdown.baseCommission.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">VAT (16% on fee)</span>
                <span className="font-medium text-slate-900">
                  KSh {feePreview.breakdown.vatAmount.toLocaleString()}
                </span>
              </div>
              {feePreview.breakdown.floorAdjustment !== undefined &&
                feePreview.breakdown.floorAdjustment > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Floor Adjustment</span>
                    <span className="font-medium">
                      +KSh{" "}
                      {feePreview.breakdown.floorAdjustment.toLocaleString()}
                    </span>
                  </div>
                )}
              {feePreview.breakdown.capAdjustment !== undefined &&
                feePreview.breakdown.capAdjustment > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Cap Adjustment</span>
                    <span className="font-medium">
                      -KSh {feePreview.breakdown.capAdjustment.toLocaleString()}
                    </span>
                  </div>
                )}
            </div>
            <div className="border-t-2 border-[#c8c8c8] pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">
                  Total Deductions
                </span>
                <span className="font-semibold text-slate-900">
                  KSh {feePreview.totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="border-t border-[#c8c8c8] pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-green-700">
                  Your Payout
                </span>
                <span className="text-lg font-bold text-green-700">
                  KSh {feePreview.vendorPayout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Rule Indicator */}
          <div className="mt-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                feePreview.ruleType === "STANDARD" &&
                  "bg-blue-50 text-blue-700 border border-blue-200",
                feePreview.ruleType === "FLOOR" &&
                  "bg-amber-50 text-amber-700 border border-amber-200",
                feePreview.ruleType === "CAP" &&
                  "bg-purple-50 text-purple-700 border border-purple-200"
              )}
            >
              {feePreview.ruleType === "STANDARD" && (
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {feePreview.ruleType === "FLOOR" && (
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7 7 7m-7-7v18"
                  />
                </svg>
              )}
              {feePreview.ruleType === "CAP" && (
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              {feePreview.ruleType} Rule
            </span>
            {feePreview.minFee > 0 && (
              <span className="ml-2 text-xs text-slate-500">
                Min: KSh {feePreview.minFee.toLocaleString()}
              </span>
            )}
            {feePreview.maxFee > 0 && (
              <span className="ml-2 text-xs text-slate-500">
                Max: KSh {feePreview.maxFee.toLocaleString()}
              </span>
            )}
          </div>

          {/* Rules Legend */}
          {showLegend && (
            <div className="mt-4">
              <CommissionRulesLegend variant="card" showExamples={false} />
            </div>
          )}
        </>
      )}

      {!feePreview && !isCalculatingFees && !feeError && (
        <p className="text-xs text-slate-500">
          Enter a price and select a category to see fee preview
        </p>
      )}
    </div>
  );
}
