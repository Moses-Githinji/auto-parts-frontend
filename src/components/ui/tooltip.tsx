import * as React from "react";
import { cn } from "../../lib/cn";

// Context for compound component pattern
interface TooltipContextValue {
  show: boolean;
  setShow: (show: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip compound components must be used within a Tooltip");
  }
  return context;
}

// Type for compound component elements
interface TooltipChildProps {
  children: React.ReactNode;
  className?: string;
}

// Simple Tooltip component - supports both simple and compound patterns
export interface TooltipProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [show, setShow] = React.useState(false);
  const [childContent, setChildContent] = React.useState<React.ReactNode>(null);

  // Extract children to check for compound component pattern
  const childrenArray = React.Children.toArray(children);
  
  // Check if using compound pattern (TooltipTrigger + TooltipContent)
  const hasTrigger = childrenArray.some(
    (child) => React.isValidElement(child) && (child.type === TooltipTrigger || (child.type as React.ComponentType<any>)?.displayName === "TooltipTrigger")
  );
  const hasContent = childrenArray.some(
    (child) => React.isValidElement(child) && (child.type === TooltipContent || (child.type as React.ComponentType<any>)?.displayName === "TooltipContent")
  );

  const isCompoundPattern = hasTrigger && hasContent;

  // Extract content from compound pattern
  React.useEffect(() => {
    if (isCompoundPattern) {
      childrenArray.forEach((child) => {
        if (React.isValidElement(child)) {
          const childElement = child as React.ReactElement<{ children?: React.ReactNode }>;
          const childType = childElement.type as React.ComponentType<any>;
          if (childType === TooltipContent || childType?.displayName === "TooltipContent") {
            setChildContent(childElement.props.children);
          }
        }
      });
    }
  }, [isCompoundPattern, childrenArray]);

  const tooltipContent = isCompoundPattern ? childContent : content;

  // Click outside to close tooltip
  React.useEffect(() => {
    if (!show) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tooltipElement = target.closest('[data-tooltip-container]');
      if (!tooltipElement) {
        setShow(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [show]);

  return (
    <TooltipContext.Provider value={{ show, setShow }}>
      <div 
        className="relative flex items-center"
        data-tooltip-container
      >
        {children}
        {show && tooltipContent && (
          <div className={cn(
            "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-64 p-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg shadow-xl text-xs animate-in fade-in zoom-in duration-200",
            className
          )}>
            {tooltipContent}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-dark-surface" />
          </div>
        )}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export interface TooltipTriggerProps extends TooltipChildProps {
  asChild?: boolean;
}

// Add displayName for type checking
TooltipTrigger.displayName = "TooltipTrigger";

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  // Use context to access tooltip state for click-based toggle
  const { show, setShow } = useTooltipContext();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow(!show);
  };
  
  // Wrap children with click handler
  return (
    <span onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </span>
  );
}

export interface TooltipContentProps extends TooltipChildProps {}

TooltipContent.displayName = "TooltipContent";

export function TooltipContent({ children, className }: TooltipContentProps) {
  return <div className={className}>{children}</div>;
}
