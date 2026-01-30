import { useState, useEffect } from "react";
import { cn } from "../../lib/cn";

export interface DealBannerProps {
  /** Type of deal banner */
  variant?: "flash-sale" | "bulk-deal" | "new-arrival";
  /** Main headline text */
  headline: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Discount percentage */
  discountPercent?: number;
  /** Original price (for showing strike-through) */
  originalPrice?: string;
  /** Sale price */
  salePrice?: string;
  /** Currency symbol */
  currency?: string;
  /** Fitment/badge text */
  fitmentText?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Countdown end time (ISO date string) */
  countdownEnd?: string;
  /** Button text */
  buttonText?: string;
  /** Button click handler */
  onButtonClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable "Today's Deals" banner component for The Auto Parts Store Kenya.
 * Implements Amazon-style psychological triggers with automotive aesthetics.
 */
export function DealBanner({
  variant = "flash-sale",
  headline,
  subtitle,
  discountPercent,
  originalPrice,
  salePrice,
  currency = "KSh",
  fitmentText,
  imageUrl,
  imageAlt = "Product",
  countdownEnd,
  buttonText = "Shop the Deal",
  onButtonClick,
  className,
}: DealBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Calculate time remaining for countdown
  useEffect(() => {
    if (!countdownEnd) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(countdownEnd).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownEnd]);

  // Variant-specific styles
  const variantStyles = {
    "flash-sale": {
      bg: "bg-[#1A1A1A]",
      badge: "bg-[#CC0C39]",
      button: "bg-[#FFD814] hover:bg-[#F7CA00] text-black",
      accent: "text-[#F3D019]",
      text: "text-white",
      subtext: "text-gray-400",
    },
    "bulk-deal": {
      bg: "bg-white",
      badge: "bg-[#007185]",
      button: "bg-[#007185] hover:bg-[#005F8C] text-white",
      accent: "text-[#007185]",
      text: "text-slate-900",
      subtext: "text-gray-600",
    },
    "new-arrival": {
      bg: "bg-slate-50",
      badge: "bg-green-600",
      button: "bg-slate-900 hover:bg-slate-800 text-white",
      accent: "text-slate-700",
      text: "text-slate-900",
      subtext: "text-gray-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-6 flex justify-between items-center",
        styles.bg,
        className,
      )}
    >
      {/* Left: Content */}
      <div className="z-10 max-w-md">
        {/* Urgency Badge */}
        {variant === "flash-sale" && (
          <span
            className={cn(
              "inline-block px-2 py-1 text-xs font-bold uppercase mb-3",
              styles.badge,
            )}
          >
            Limited Time Deal
          </span>
        )}

        {variant === "bulk-deal" && (
          <span
            className={cn(
              "inline-block px-2 py-1 text-xs font-bold uppercase mb-3",
              styles.badge,
            )}
          >
            Wholesale Price
          </span>
        )}

        {variant === "new-arrival" && (
          <span
            className={cn(
              "inline-block px-2 py-1 text-xs font-bold uppercase mb-3",
              styles.badge,
            )}
          >
            New Arrival
          </span>
        )}

        {/* Headline */}
        <h2 className={cn("text-3xl font-black", styles.text)}>{headline}</h2>

        {/* Subtitle */}
        {subtitle && (
          <p className={cn("mt-2 text-sm", styles.subtext)}>{subtitle}</p>
        )}

        {/* Price Display */}
        {(originalPrice || salePrice) && (
          <div className="mt-4 flex items-baseline gap-3">
            {originalPrice && (
              <span className={cn("text-lg line-through", styles.subtext)}>
                {currency} {originalPrice}
              </span>
            )}
            {salePrice && (
              <span className={cn("text-4xl font-bold", styles.accent)}>
                {currency} {salePrice}
              </span>
            )}
            {discountPercent && (
              <span
                className={cn(
                  "px-2 py-0.5 text-sm font-bold rounded",
                  styles.badge,
                  "text-white",
                )}
              >
                {discountPercent}% OFF
              </span>
            )}
          </div>
        )}

        {/* Fitment Badge */}
        {fitmentText && (
          <div className="mt-3 inline-block">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full border",
                variant === "flash-sale"
                  ? "border-[#F3D019] text-[#F3D019]"
                  : "border-[#565959] text-gray-600",
              )}
            >
              {fitmentText}
            </span>
          </div>
        )}

        {/* Countdown Timer */}
        {timeLeft && (
          <div className="mt-4">
            <p className={cn("text-xs font-medium", styles.subtext)}>
              Ends in:{" "}
              <span
                className={cn("font-mono font-bold text-lg", styles.accent)}
              >
                {timeLeft}
              </span>
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onButtonClick}
          className={cn(
            "mt-5 px-6 py-2 rounded-full font-bold transition-colors",
            styles.button,
          )}
        >
          {buttonText}
        </button>
      </div>

      {/* Right: Product Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute right-[-20px] top-0 h-full object-contain opacity-80 max-w-[50%]"
        />
      )}
    </div>
  );
}

// Example usage component for quick reference
export function DealBannerExamples() {
  return (
    <div className="space-y-6">
      {/* Flash Sale Banner */}
      <DealBanner
        variant="flash-sale"
        headline="1,200 OFF"
        subtitle="On all Genuine Toyota Oil Filters"
        originalPrice="5,000"
        salePrice="3,800"
        discountPercent={24}
        fitmentText="Fits Most Vitz/Demio"
        countdownEnd={new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()}
      />

      {/* Bulk Deal Banner */}
      <DealBanner
        variant="bulk-deal"
        headline="Bulk Pack: 10 Filters"
        subtitle="Perfect for garages and workshops"
        originalPrice="25,000"
        salePrice="18,500"
        discountPercent={26}
        fitmentText="Universal Fit"
        buttonText="Request Quote"
      />

      {/* New Arrival Banner */}
      <DealBanner
        variant="new-arrival"
        headline="Premium LED Headlights"
        subtitle="High lumens, low power consumption"
        salePrice="From 4,500"
        fitmentText="H4/H7/H11 Available"
        imageUrl="/images/led-headlights.png"
      />
    </div>
  );
}
