import type { UIConfig } from "../../types/vendor";
import { cn } from "../../lib/cn";

interface VendorHealthBadgeProps {
  uiConfig: UIConfig;
  className?: string;
  showIcon?: boolean;
}

export function VendorHealthBadge({ 
  uiConfig, 
  className,
  showIcon = true 
}: VendorHealthBadgeProps) {
  return (
    <div 
      style={{ 
        backgroundColor: uiConfig.bg, 
        color: uiConfig.color,
        borderColor: uiConfig.color + '20' // Subtle border using the text color
      }} 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm transition-all hover:brightness-95",
        className
      )}
      title={uiConfig.description}
    >
      {showIcon && <span className="text-sm leading-none">{uiConfig.icon}</span>}
      <span className="uppercase tracking-wide">{uiConfig.label}</span>
    </div>
  );
}
