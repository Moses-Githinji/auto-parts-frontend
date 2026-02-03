import { cn } from "../../lib/cn";

interface CommissionRulesLegendProps {
  variant?: "inline" | "card" | "tooltip";
  showExamples?: boolean;
  className?: string;
}

const ruleDefinitions = {
  STANDARD: {
    title: "STANDARD",
    description: "Regular percentage-based commission",
    icon: (
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "bg-blue-50 text-blue-700 border-blue-200",
    example: "8% of KSh 10,000 = KSh 800",
  },
  FLOOR: {
    title: "FLOOR",
    description: "Minimum fee applied when commission is below floor",
    icon: (
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
          d="M5 10l7-7 7 7m-7-7v18"
        />
      </svg>
    ),
    color: "bg-amber-50 text-amber-700 border-amber-200",
    example: "8% of KSh 500 = KSh 40, but floor is KSh 50 = KSh 50",
  },
  CAP: {
    title: "CAP",
    description: "Maximum fee cap applied when commission exceeds cap",
    icon: (
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
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ),
    color: "bg-purple-50 text-purple-700 border-purple-200",
    example: "8% of KSh 30,000 = KSh 2,400, but cap is KSh 2,000 = KSh 2,000",
  },
};

export function CommissionRulesLegend({
  variant = "inline",
  showExamples = true,
  className,
}: CommissionRulesLegendProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {Object.entries(ruleDefinitions).map(([key, rule]) => (
          <div
            key={key}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
              rule.color
            )}
          >
            {rule.icon}
            <span>{rule.title}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "tooltip") {
    return (
      <div className={cn("space-y-2 p-2", className)}>
        {Object.entries(ruleDefinitions).map(([key, rule]) => (
          <div key={key} className="flex items-start gap-2">
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs",
                rule.color
              )}
            >
              {rule.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-900">{rule.title}</p>
              <p className="text-[10px] text-slate-600">{rule.description}</p>
              {showExamples && (
                <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
                  {rule.example}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        "rounded-sm border border-[#e8e8e8] bg-white p-3",
        className
      )}
    >
      <h5 className="mb-2 text-xs font-semibold text-slate-900">
        Commission Rule Types
      </h5>
      <div className="space-y-2">
        {Object.entries(ruleDefinitions).map(([key, rule]) => (
          <div
            key={key}
            className={cn(
              "flex items-start gap-2 rounded-sm p-2",
              rule.color.split(" ")[0] // Just get the background color
            )}
          >
            <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
              {rule.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">{rule.title}</p>
              <p className="text-[10px] opacity-80">{rule.description}</p>
              {showExamples && (
                <p className="mt-0.5 text-[10px] opacity-70 font-mono">
                  {rule.example}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
