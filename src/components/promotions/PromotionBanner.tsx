import { motion } from "framer-motion";
import { Tag, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePromotionStore } from "../../stores/promotionStore";
import { Button } from "../ui/button";

interface PromotionBannerProps {
  className?: string;
}

export function PromotionBanner({ className }: PromotionBannerProps) {
  const navigate = useNavigate();
  // Fixed: Subscribe to the result of getActivePromotion to ensure re-renders
  const activePromo = usePromotionStore((s) => s.getActivePromotion());
  const isLoading = usePromotionStore((s) => s.isLoading);
  const error = usePromotionStore((s) => s.error);

  if (!activePromo) {
    return null;
  }

  const isPercentage = activePromo.discountType === "PERCENTAGE";
  const discountText = isPercentage 
    ? `${activePromo.discountValue}% OFF` 
    : `KES ${activePromo.discountValue} OFF`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#ff0080] p-6 text-white shadow-xl ${className}`}
    >
      {/* Animated background elements */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-10"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-yellow-400 p-3 shadow-inner">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Tag className="h-6 w-6 text-[#080808]" />
            </motion.div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                Vendor Promotion
              </span>
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </div>
            <h3 className="text-xl font-extrabold md:text-2xl">
              {activePromo.name}
            </h3>
            <p className="text-sm text-blue-100">
              {activePromo.description || `Get ${discountText} marketplace commission fees!`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 md:items-end">
          <div className="text-center md:text-right">
            <span className="text-3xl font-black text-yellow-400 drop-shadow-md">
              {discountText}
            </span>
            <p className="text-[10px] uppercase text-blue-200">
              Limited spots available
            </p>
          </div>
          <Button
            onClick={() => navigate("/register")}
            className="group bg-yellow-400 text-[#080808] hover:bg-yellow-300 px-6 font-bold shadow-lg"
          >
            Join as Vendor
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
