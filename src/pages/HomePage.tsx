import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Wrench,
  Shield,
  Truck,
  Star,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";

const DEFAULT_VENDOR = {
  vendorId: "nairobi-genuine",
  vendorName: "Nairobi Genuine Parts",
};

// Mock user garage - in real app this would come from user data
const USER_GARAGE = [
  { make: "Toyota", model: "Hilux", year: 2018, nickname: "My Workhorse" },
];

// Recently viewed products - mock data
const recentlyViewed = [
  {
    partNumber: "04465-0K390",
    name: "Front Brake Pad Set",
    brand: "Toyota OEM",
    price: "KES 7,800",
    image: "🔧",
  },
  {
    partNumber: "17801-0K010",
    name: "Oil Filter",
    brand: "Toyota Genuine",
    price: "KES 1,200",
    image: "⚙️",
  },
  {
    partNumber: "15400-PLM-A02",
    name: "Air Filter",
    brand: "Honda Genuine",
    price: "KES 950",
    image: "💨",
  },
  {
    partNumber: "36531-T6A-A01",
    name: "Spark Plug (4pc)",
    brand: "NGK",
    price: "KES 2,400",
    image: "⚡",
  },
];

// Top picks for user's vehicle
const topPicksForHilux = [
  {
    partNumber: "04465-0K390",
    name: "Front Brake Pad Set",
    brand: "Toyota OEM",
    price: "KES 7,800",
    unitPrice: 7800,
    rating: 4.8,
    delivery: "Tomorrow",
    image: "🔧",
    reason: "Best seller for Hilux",
  },
  {
    partNumber: "90915-YZZE1",
    name: "Air Filter",
    brand: "Toyota Genuine",
    price: "KES 850",
    unitPrice: 850,
    rating: 4.9,
    delivery: "Today",
    image: "💨",
    reason: "Direct fit for 2018 Hilux",
  },
  {
    partNumber: "43512-0K020",
    name: "Shock Absorber (Pair)",
    brand: "KYB",
    price: "KES 18,500",
    unitPrice: 18500,
    rating: 4.7,
    delivery: "2 days",
    image: "🚗",
    reason: "Premium quality",
  },
  {
    partNumber: "12100-0K030",
    name: "Oil Filter Set (3pc)",
    brand: "Toyota Genuine",
    price: "KES 2,800",
    unitPrice: 2800,
    rating: 5.0,
    delivery: "Today",
    image: "🛢️",
    reason: "Service essential",
  },
];

// Grid cards data
const gridCards = [
  {
    title: "Best Sellers in Brake System",
    subtitle: "Top-rated parts for your vehicle",
    items: [
      { name: "Brake Pads", price: "From KES 3,500" },
      { name: "Rotors", price: "From KES 5,200" },
      { name: "Brake Fluid", price: "KES 800" },
    ],
    image: "🛑",
  },
  {
    title: "New Arrivals in Suspension",
    subtitle: "Latest parts just added",
    items: [
      { name: "Shock Absorbers", price: "From KES 8,500" },
      { name: "Springs", price: "From KES 4,200" },
      { name: "Bushings", price: "From KES 1,200" },
    ],
    image: "🔧",
  },
  {
    title: "Deals of the Day",
    subtitle: "Limited-time offers",
    items: [
      { name: "Oil Change Kit", price: "KES 3,200", wasPrice: "KES 4,500" },
      { name: "Wiper Blades", price: "KES 1,500", wasPrice: "KES 2,200" },
      { name: "Battery 12V", price: "KES 12,000", wasPrice: "KES 15,000" },
    ],
    image: "🔥",
  },
  {
    title: "Trending in Electrical",
    subtitle: "Popular this week",
    items: [
      { name: "Alternators", price: "From KES 15,000" },
      { name: "Starters", price: "From KES 12,500" },
      { name: "Sensors", price: "From KES 800" },
    ],
    image: "⚡",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const popularCategories = [
    {
      name: "Brake System",
      icon: Wrench,
      count: "2,450+ parts",
      color: "bg-red-100 text-red-800",
    },
    {
      name: "Filters & Service",
      icon: Zap,
      count: "1,890+ parts",
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Suspension",
      icon: Car,
      count: "1,230+ parts",
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Electrical",
      icon: Zap,
      count: "980+ parts",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  const popularParts = [
    {
      partNumber: "04465-0K390",
      name: "Front Brake Pad Set",
      brand: "Toyota OEM",
      price: "KES 7,800",
      unitPrice: 7800,
      vendors: 3,
      rating: 4.8,
      delivery: "Tomorrow",
      image: "🔧",
    },
    {
      partNumber: "17801-0K010",
      name: "Oil Filter",
      brand: "Toyota Genuine",
      price: "KES 1,200",
      unitPrice: 1200,
      vendors: 5,
      rating: 4.9,
      delivery: "Today",
      image: "⚙️",
    },
    {
      partNumber: "43512-0K020",
      name: "Shock Absorber",
      brand: "Toyota OEM",
      price: "KES 12,500",
      unitPrice: 12500,
      vendors: 2,
      rating: 4.7,
      delivery: "2 days",
      image: "🚗",
    },
    {
      partNumber: "90915-YZZE1",
      name: "Air Filter",
      brand: "Toyota Genuine",
      price: "KES 850",
      unitPrice: 850,
      vendors: 8,
      rating: 4.9,
      delivery: "Today",
      image: "💨",
    },
  ];

  function handleAddToCart(part: (typeof popularParts)[0]) {
    addItem({
      partNumber: part.partNumber,
      partName: part.name,
      vendorId: DEFAULT_VENDOR.vendorId,
      vendorName: DEFAULT_VENDOR.vendorName,
      unitPrice: part.unitPrice,
      currency: "KES",
      quantity: 1,
    });
  }

  const deals = [
    { title: "Free delivery", subtitle: "Orders over KES 5,000", icon: Truck },
    { title: "Same-day pickup", subtitle: "Nairobi vendors", icon: Clock },
    { title: "Verified parts", subtitle: "QR code check", icon: Shield },
  ];

  // Promotional banners data
  const promotionalBanners = [
    {
      title: "Rainy Season Essentials",
      subtitle: "Wipers, filters & batteries – up to 25% off",
      badge: "Limited time",
      bg: "bg-blue-50",
      onClick: () => navigate("/search?q=rainy+season"),
    },
    {
      title: "Toyota Hilux Service Kit",
      subtitle: "Oil + air + fuel filter combo",
      badge: "Save KES 1,800",
      bg: "bg-amber-50",
      onClick: () => navigate("/search?q=hilux+service+kit"),
    },
    {
      title: "Free Delivery Nationwide",
      subtitle: "On orders over KES 8,000 this week",
      badge: "Promo",
      bg: "bg-green-50",
      onClick: () => navigate("/search"),
    },
  ];

  // Trusted brands data
  const trustedBrands = [
    { name: "Toyota Genuine", count: "12,400+ parts" },
    { name: "Denso", count: "3,200+ parts" },
    { name: "NGK", count: "1,800+ parts" },
    { name: "KYB", count: "980+ parts" },
    { name: "Bosch", count: "2,100+ parts" },
    { name: "Isuzu", count: "4,500+ parts" },
  ];

  // Customer reviews data
  const customerReviews = [
    {
      name: "James M.",
      location: "Nairobi",
      text: "Got my Hilux brake pads in perfect condition and arrived same day. Best price I found!",
      rating: 5,
    },
    {
      name: "Aisha K.",
      location: "Mombasa",
      text: "Finally found genuine Denso parts without going to Industrial Area. Delivery was fast.",
      rating: 5,
    },
    {
      name: "Peter O.",
      location: "Nakuru",
      text: "Compared 4 vendors — saved over KSh 3,000 on shocks. Will buy again.",
      rating: 4,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner - Amazon Style */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#131921] via-[#232F3E] to-[#131921] p-6 text-white md:p-10">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-3 bg-[#FF9900] text-[#131921]">
            Kenya's #1 Auto Parts Marketplace
          </Badge>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Find Genuine Parts for Your Vehicle
          </h1>
          <p className="mb-6 text-sm text-slate-200 md:text-base">
            Search by part number, vehicle make/model, or browse categories.
            Compare prices from verified vendors across Kenya with accurate
            fitment data.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              className="bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
              onClick={() => navigate("/search")}
            >
              Start Shopping
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-500 text-slate-900 hover:border-transparent hover:bg-slate-700 hover:text-white"
              onClick={() => navigate("/account/garage")}
            >
              My Garage
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#232F3E]/50 to-transparent" />
      </section>

      {/* Keep Shopping For (Recently Viewed) */}
      {recentlyViewed.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Keep Shopping For
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600"
              onClick={() => navigate("/account/history")}
            >
              View browsing history <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentlyViewed.map((item) => (
              <button
                key={item.partNumber}
                onClick={() => navigate(`/parts/${item.partNumber}`)}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-sky-300 hover:shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-100 text-2xl">
                  {item.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {item.price}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top Picks for Your Vehicle */}
      {USER_GARAGE.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Top Picks for Your {USER_GARAGE[0].make} {USER_GARAGE[0].model}
              </h2>
              <p className="text-xs text-slate-600">
                Parts that fit your {USER_GARAGE[0].year} {USER_GARAGE[0].model}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600"
              onClick={() =>
                navigate(
                  `/search?make=${USER_GARAGE[0].make}&model=${USER_GARAGE[0].model}`,
                )
              }
            >
              See all for {USER_GARAGE[0].model}{" "}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {topPicksForHilux.map((part) => (
              <div
                key={part.partNumber}
                className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-[#FF9900] hover:shadow-md"
                onClick={() => navigate(`/parts/${part.partNumber}`)}
              >
                <div className="mb-2 flex h-16 items-center justify-center rounded-md bg-slate-100 text-3xl">
                  {part.image}
                </div>
                <Badge className="mb-1 bg-green-100 text-green-800 text-[10px]">
                  {part.reason}
                </Badge>
                <p className="mb-1 text-[10px] font-mono text-slate-500">
                  {part.partNumber}
                </p>
                <h3 className="mb-1 text-sm font-semibold text-slate-900 line-clamp-2">
                  {part.name}
                </h3>
                <p className="mb-2 text-xs text-slate-600">{part.brand}</p>
                <div className="mb-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(part.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">
                    {part.price}
                  </span>
                </div>
                <p className="mb-2 text-[10px] text-slate-600">
                  Delivery: {part.delivery}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(part as any);
                  }}
                >
                  Add to cart
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banners */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotionalBanners.map((promo, i) => (
          <div
            key={i}
            className={`cursor-pointer rounded-lg ${promo.bg} p-6 transition hover:shadow-md`}
            onClick={promo.onClick}
          >
            <Badge className="mb-2 bg-red-500 text-white">{promo.badge}</Badge>
            <h3 className="mb-1 text-lg font-semibold">{promo.title}</h3>
            <p className="text-sm text-slate-700">{promo.subtitle}</p>
            <Button variant="ghost" className="mt-3 p-0 text-sky-600">
              Shop now →
            </Button>
          </div>
        ))}
      </section>

      {/* Vehicle Selector Widget */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Car className="h-5 w-5 text-[#FF9900]" />
          <h2 className="text-lg font-semibold text-slate-900">
            Find Parts for Your Vehicle
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Make
            </label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20"
            >
              <option value="">Select make</option>
              <option value="toyota">Toyota</option>
              <option value="nissan">Nissan</option>
              <option value="mazda">Mazda</option>
              <option value="honda">Honda</option>
              <option value="isuzu">Isuzu</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedMake}
              className="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20"
            >
              <option value="">Select model</option>
              {selectedMake === "toyota" && (
                <>
                  <option value="hilux">Hilux</option>
                  <option value="landcruiser">Land Cruiser</option>
                  <option value="corolla">Corolla</option>
                  <option value="rav4">RAV4</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Year
            </label>
            <Input
              type="number"
              placeholder="e.g. 2015"
              className="h-10 rounded-sm"
              min="1990"
              max="2025"
            />
          </div>
          <div className="flex items-end">
            <Button
              className="h-10 w-full rounded-sm bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
              onClick={() => navigate("/search")}
            >
              Find Parts
            </Button>
          </div>
        </div>
      </section>

      {/* Grid Cards - 4 column layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {gridCards.map((card, i) => (
          <div
            key={i}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-md"
            onClick={() => navigate("/search")}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{card.image}</span>
              <h3 className="text-sm font-semibold text-slate-900">
                {card.title}
              </h3>
            </div>
            <p className="mb-3 text-xs text-slate-600">{card.subtitle}</p>
            <ul className="space-y-1">
              {card.items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-medium text-slate-900">
                    {item.price}
                    {"wasPrice" in item && item.wasPrice && (
                      <span className="ml-1 text-xs text-slate-400 line-through">
                        {item.wasPrice}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-xs text-sky-600"
            >
              See more <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Popular Categories Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Shop by Category
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/search")}>
            View all
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {popularCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate("/search")}
                className="group rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-[#FF9900] hover:shadow-md"
              >
                <div
                  className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${cat.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                <p className="mt-1 text-xs text-slate-600">{cat.count}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Parts / Best Sellers */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#FF9900]" />
            <h2 className="text-lg font-semibold text-slate-900">
              Best Sellers
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/search")}>
            See more
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {popularParts.map((part) => (
            <div
              key={part.partNumber}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-[#FF9900] hover:shadow-lg"
              onClick={() => navigate(`/parts/${part.partNumber}`)}
            >
              <div className="mb-2 flex h-16 items-center justify-center rounded-md bg-slate-100 text-3xl">
                {part.image}
              </div>
              <p className="mb-1 text-[10px] font-mono text-slate-500">
                {part.partNumber}
              </p>
              <h3 className="mb-1 text-sm font-semibold text-slate-900 line-clamp-2">
                {part.name}
              </h3>
              <p className="mb-2 text-xs text-slate-600">{part.brand}</p>
              <div className="mb-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(part.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
                <span className="ml-1 text-[10px] text-slate-600">
                  ({part.rating})
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  {part.price}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {part.vendors} vendors
                </Badge>
              </div>
              <p className="mb-2 text-[10px] text-slate-600">
                Delivery: {part.delivery}
              </p>
              <Button
                size="sm"
                className="w-full bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(part);
                }}
              >
                Add to cart
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted Brands */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Trusted Brands
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/brands")}>
            View all brands
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {trustedBrands.map((brand) => (
            <button
              key={brand.name}
              onClick={() =>
                navigate(`/search?brand=${encodeURIComponent(brand.name)}`)
              }
              className="group flex flex-col items-center rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-[#FF9900] hover:shadow-md"
            >
              <div className="mb-2 h-16 w-16 rounded-full bg-slate-100 text-3xl flex items-center justify-center">
                {brand.name.charAt(0)}
              </div>
              <h3 className="text-sm font-semibold">{brand.name}</h3>
              <p className="text-xs text-slate-500">{brand.count}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Deals & Benefits */}
      <section className="grid gap-4 md:grid-cols-3">
        {deals.map((deal) => {
          const Icon = deal.icon;
          return (
            <div
              key={deal.title}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4"
            >
              <div className="rounded-full bg-[#F7CA00]/20 p-2">
                <Icon className="h-5 w-5 text-[#FF9900]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{deal.title}</h3>
                <p className="text-xs text-slate-600">{deal.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Trust & Security */}
      <section className="rounded-lg border border-slate-200 bg-[#EAEDED] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Why Shop with Us?
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Verified Vendors
              </p>
              <p className="text-xs text-slate-600">
                All vendors pass KYC checks
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Accurate Fitment
              </p>
              <p className="text-xs text-slate-600">
                Vehicle-specific compatibility
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Nationwide Delivery
              </p>
              <p className="text-xs text-slate-600">
                Fast shipping across Kenya
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Best Prices
              </p>
              <p className="text-xs text-slate-600">Compare multiple vendors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-6">
        <h2 className="mb-6 text-center text-xl font-bold text-slate-900">
          What Our Customers Say
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {customerReviews.map((review, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${
                      idx < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="mb-4 text-sm text-slate-700">"{review.text}"</p>
              <div className="text-xs text-slate-500">
                <strong>{review.name}</strong> • {review.location}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate("/reviews")}>
            Read more reviews
          </Button>
        </div>
      </section>

      {/* Popular Searches */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Brake pads Toyota Hilux",
            "Oil filter Nissan Navarra",
            "Shock absorber Mazda Demio",
            "Air filter Honda CR-V",
            "Spark plugs",
            "Timing belt",
            "Radiator",
            "Battery",
          ].map((term) => (
            <button
              key={term}
              onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition-colors hover:border-[#FF9900] hover:bg-slate-50 hover:text-[#131921]"
            >
              {term}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
