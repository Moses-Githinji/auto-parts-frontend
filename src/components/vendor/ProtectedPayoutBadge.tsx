import { ShieldCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/cn";

interface ProtectedPayoutBadgeProps {
  showText?: boolean;
  className?: string;
}

export function ProtectedPayoutBadge({ showText = true, className = "" }: ProtectedPayoutBadgeProps) {
  const protectionText = `SakaParts Risk Pool Protection: This order's payout is protected. Even if shipping issues or "Damaged on Arrival" claims occur, our collective risk pool covers the return logistics, protecting your business from sudden losses. Funds are released after the 14-day customer protection period if no disputes are raised.`;

  return (
    <Badge 
      variant="outline" 
      title={protectionText}
      className={cn(
        "bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5 py-0.5 cursor-help shrink-0 whitespace-nowrap",
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {showText && <span>Protected Payout</span>}
    </Badge>
  );
}
