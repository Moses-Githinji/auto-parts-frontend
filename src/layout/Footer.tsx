import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = [
    {
      title: "Get to Know Us",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Make Money with Us",
      links: [
        { label: "Sell on AutoParts", href: "/vendor" },
        { label: "Become a Rider", href: "/delivery" },
        { label: "Advertise Products", href: "/advertise" },
      ],
    },
    {
      title: "Payment & Delivery",
      links: [
        { label: "Shipping Rates", href: "/shipping" },
        { label: "Returns & Replacements", href: "/returns" },
        { label: "Payment Methods", href: "/payments" },
      ],
    },
    {
      title: "Let Us Help You",
      links: [
        { label: "Your Account", href: "/account" },
        { label: "Your Orders", href: "/account/orders" },
        { label: "Help & FAQ", href: "/help" },
      ],
    },
  ];

  return (
    <footer className="hidden md:block">
      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        className="w-full bg-slate-200 dark:bg-slate-800 py-3 text-center text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
      >
        Back to top
      </button>

      {/* Main footer links */}
      <div className="bg-slate-100 dark:bg-dark-bgLight px-6 py-10 border-t border-slate-200 dark:border-dark-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-dark-text">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => navigate(link.href)}
                      className="text-xs text-slate-600 dark:text-dark-textMuted hover:text-[#FF9900] dark:hover:text-[#FF9900] hover:underline transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white dark:bg-dark-bg px-6 py-6 border-t border-slate-200 dark:border-dark-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-xs text-slate-500 dark:text-dark-textMuted">
            © {new Date().getFullYear()} AutoParts Kenya. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="text-xs text-slate-500 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text transition-colors"
            >
              Privacy Notice
            </button>
            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="text-xs text-slate-500 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text transition-colors"
            >
              Terms of Use
            </button>
            <button
              type="button"
              onClick={() => navigate("/cookies")}
              className="text-xs text-slate-500 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text transition-colors"
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
