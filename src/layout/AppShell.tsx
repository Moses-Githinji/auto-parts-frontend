import { useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Home,
  Settings,
  User,
  Search,
  Clock,
  Wrench,
  Zap,
  Car,
  Filter,
  Battery,
  Disc,
  Truck,
} from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

interface AppShellProps {
  children: ReactNode;
}

/** Categories for the dropdown and slide-out menu */
const CATEGORIES = [
  { name: "All Departments", icon: Menu, subcategories: [] },
  {
    name: "Brake System",
    icon: Disc,
    subcategories: ["Brake Pads", "Rotors", "Calipers", "Brake Lines"],
  },
  {
    name: "Engine Parts",
    icon: Wrench,
    subcategories: [
      "Oil Filters",
      "Air Filters",
      "Spark Plugs",
      "Timing Belts",
    ],
  },
  {
    name: "Electrical",
    icon: Battery,
    subcategories: ["Batteries", "Alternators", "Starters", "Sensors"],
  },
  {
    name: "Suspension",
    icon: Settings,
    subcategories: ["Shock Absorbers", "Springs", "Bushings", "Control Arms"],
  },
  {
    name: "Filters & Service",
    icon: Filter,
    subcategories: ["Oil Filters", "Fuel Filters", "Cabin Filters"],
  },
  {
    name: "Steering",
    icon: Zap,
    subcategories: ["Power Steering Pump", "Tie Rods", "Steering Rack"],
  },
  {
    name: "Body & Collision",
    icon: Car,
    subcategories: ["Bumpers", "Mirrors", "Headlights", "Grilles"],
  },
];

/** Wrapper that calls useLocation so AppShell only receives pathname */
export function AppShell({ children }: AppShellProps) {
  const pathname = useLocation().pathname;

  const isVendorContext = pathname.startsWith("/vendor");
  const isAdminContext = pathname.startsWith("/admin");

  if (isVendorContext || isAdminContext) {
    return <BackofficeShell>{children}</BackofficeShell>;
  }

  return <StorefrontShell>{children}</StorefrontShell>;
}

function StorefrontShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.itemCount());
  const [showDepartments, setShowDepartments] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock user location (would come from geolocation in real app)
  const userLocation = "Westlands, Nairobi";

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    if (searchQuery) {
      navigate(
        `/search?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(category)}`,
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#EAEDED]">
      {/* Amazon-style Header */}
      <header className="bg-[#131921] text-slate-50 sticky top-0 z-50">
        {/* Top row: Logo, Search, Account, Orders, Cart */}
        <div className="flex items-center gap-2 px-2 py-1.5 md:px-4 md:py-2">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1 rounded-sm px-1.5 py-1 hover:outline hover:outline-1 hover:outline-slate-400"
          >
            <span className="inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-sm bg-[#FF9900] text-[10px] md:text-[10px] font-bold text-[#131921]">
              APS
            </span>
            <div className="hidden flex-col leading-tight md:flex">
              <span className="text-[10px] text-slate-300">
                The Auto Parts Store
              </span>
              <span className="text-[11px] font-semibold">.co.ke</span>
            </div>
          </button>

          {/* Delivery Location */}
          <button
            type="button"
            onClick={() => navigate("/account/addresses")}
            className="hidden items-center gap-1 rounded-sm px-2 py-1.5 text-[11px] hover:outline hover:outline-1 hover:outline-slate-400 md:flex"
          >
            <MapPin className="h-4 w-4 text-slate-300" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] text-slate-300">Deliver to</span>
              <span className="font-semibold">{userLocation}</span>
            </div>
          </button>

          {/* Search Bar with Category Dropdown */}
          <form
            className="flex flex-1 items-stretch gap-0"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(
                `/search?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(selectedCategory)}`,
              );
            }}
          >
            {/* Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex h-9 items-center gap-1 rounded-l-sm bg-slate-100 px-3 pr-8 text-[11px] text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              >
                <span className="truncate max-w-[80px]">
                  {selectedCategory === "All" ? "All" : selectedCategory}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-sm border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("All")}
                      className={`flex w-full px-3 py-2 text-left text-xs hover:bg-slate-100 ${
                        selectedCategory === "All"
                          ? "bg-slate-50 font-medium text-[#FF9900]"
                          : "text-slate-700"
                      }`}
                    >
                      All
                    </button>
                    {CATEGORIES.filter((c) => c.name !== "All Departments").map(
                      (cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => handleCategorySelect(cat.name)}
                          className={`flex w-full px-3 py-2 text-left text-xs hover:bg-slate-100 ${
                            selectedCategory === cat.name
                              ? "bg-slate-50 font-medium text-[#FF9900]"
                              : "text-slate-700"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by part number, part name, or vehicle..."
              className="h-9 flex-1 rounded-none border-none bg-white text-[13px] text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#FF9900]"
            />

            {/* Search Button */}
            <button
              type="submit"
              className="flex h-9 items-center rounded-r-sm bg-[#F7CA00] px-4 text-[13px] font-semibold text-[#131921] hover:bg-[#F7CA00]/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1">
            {/* Language / Country */}
            <button
              type="button"
              className="hidden items-center rounded-sm px-2 py-1.5 hover:outline hover:outline-1 hover:outline-slate-400 md:flex"
            >
              <span className="text-xs font-semibold">EN</span>
            </button>

            {/* Account & Lists */}
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="hidden flex-col items-start rounded-sm px-2 py-1.5 leading-tight hover:outline hover:outline-1 hover:outline-slate-400 md:flex"
            >
              <span className="text-[10px]">Hello, sign in</span>
              <span className="flex items-center gap-0.5 text-[11px] font-semibold">
                Account <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {/* Returns & Orders */}
            <button
              type="button"
              onClick={() => navigate("/account/orders")}
              className="hidden flex-col rounded-sm px-2 py-1.5 leading-tight hover:outline hover:outline-1 hover:outline-slate-400 md:flex"
            >
              <span className="text-[10px]">Returns</span>
              <span className="text-[11px] font-semibold">& Orders</span>
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative flex items-center gap-1 rounded-sm px-2 py-1.5 hover:outline hover:outline-1 hover:outline-slate-400"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-[#F7CA00] text-[10px] font-bold text-[#131921]">
                  {itemCount}
                </span>
              </div>
              <span className="hidden text-[11px] font-semibold md:inline">
                Cart
              </span>
            </button>
          </div>
        </div>

        {/* Second row: Departments, Menu button, Navigation links */}
        <div className="flex items-center gap-1 bg-[#232F3E] px-2 py-1.5 text-xs text-slate-100">
          {/* Departments Hamburger */}
          <button
            type="button"
            onClick={() => setShowDepartments(true)}
            className="flex items-center gap-1 rounded-sm px-2 py-1 font-semibold hover:bg-slate-700"
          >
            <Menu className="h-4 w-4" />
            All
          </button>

          {/* Quick Nav Links */}
          <button
            type="button"
            onClick={() => navigate("/search")}
            className="rounded-sm px-2 py-1 hover:bg-slate-700"
          >
            Today's Deals
          </button>
          <button
            type="button"
            onClick={() => navigate("/account/orders")}
            className="rounded-sm px-2 py-1 hover:bg-slate-700"
          >
            Orders
          </button>
          <button
            type="button"
            className="hidden rounded-sm px-2 py-1 hover:bg-slate-700 md:inline"
          >
            Help
          </button>
        </div>
      </header>

      {/* Departments Slide-out Menu */}
      <AnimatePresence>
        {showDepartments && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDepartments(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Slide-out panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-[#232F3E] p-4 text-white">
                  <h2 className="text-lg font-semibold">Departments</h2>
                  <button
                    type="button"
                    onClick={() => setShowDepartments(false)}
                    className="rounded-full p-1 hover:bg-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Category List */}
                <div className="flex-1 overflow-y-auto">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.name}>
                        <button
                          type="button"
                          onClick={() => {
                            navigate(
                              `/search?cat=${encodeURIComponent(category.name)}`,
                            );
                            setShowDepartments(false);
                          }}
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
                        >
                          <Icon className="h-5 w-5 text-slate-600" />
                          <span className="font-medium text-slate-900">
                            {category.name}
                          </span>
                        </button>
                        {/* Subcategories */}
                        {category.subcategories.length > 0 && (
                          <div className="bg-slate-50 px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {category.subcategories.map((sub) => (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => {
                                    navigate(
                                      `/search?cat=${encodeURIComponent(category.name)}&sub=${encodeURIComponent(sub)}`,
                                    );
                                    setShowDepartments(false);
                                  }}
                                  className="text-xs text-sky-600 hover:underline"
                                >
                                  {sub}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 px-2 py-3 md:px-4 md:py-4">
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="mx-auto max-w-7xl"
        >
          <div className="rounded-md border border-slate-200 bg-white shadow-sm md:rounded-md">
            {children}
          </div>
        </motion.div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          <TabBarButton
            icon={Home}
            label="Home"
            onClick={() => navigate("/")}
          />
          <TabBarButton
            icon={Search}
            label="Search"
            onClick={() => navigate("/search")}
          />
          <TabBarButton
            icon={Clock}
            label="Orders"
            onClick={() => navigate("/account/orders")}
          />
          <TabBarButton
            icon={Truck}
            label="Garage"
            onClick={() => navigate("/account/garage")}
          />
          <TabBarButton
            icon={User}
            label="Account"
            onClick={() => navigate("/account")}
            badge={itemCount > 0 ? itemCount : undefined}
          />
        </div>
      </div>

      {/* Spacer for mobile bottom bar */}
      <div className="h-14 md:hidden" />
    </div>
  );
}

function TabBarButton({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center py-2 text-[10px] text-slate-600 hover:text-[#131921]"
    >
      <Icon className="h-5 w-5" />
      <span className="mt-0.5">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-2 top-1 h-3 w-3 rounded-full bg-[#F7CA00] text-[9px] font-bold text-[#131921] flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function BackofficeShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const location = useLocation();
  const isVendorContext = location.pathname.startsWith("/vendor");

  return (
    <div className="flex min-h-screen flex-col bg-[#EAEDED]">
      <header className="border-b border-slate-200 bg-[#131921] text-slate-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              onClick={() => navigate("/")}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[#FF9900] text-xs font-bold text-[#131921]">
                APS
              </span>
              <span className="text-sm font-semibold">
                The Auto Parts Store
              </span>
            </button>
            <Badge
              variant="outline"
              className="ml-1 border-slate-500 text-slate-300"
            >
              Backoffice
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-300 hover:text-white"
              onClick={() => navigate("/account")}
            >
              Switch to buyer view
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#232F3E] px-4 py-1.5 text-xs text-slate-100">
          <button
            type="button"
            onClick={() => navigate(isVendorContext ? "/vendor" : "/admin")}
            className="rounded-sm px-2 py-1 font-semibold hover:bg-slate-700"
          >
            {isVendorContext ? "Vendor Dashboard" : "Admin Dashboard"}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
