import { useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useAuthStore } from "../../stores/authStore";
import { useEarningsStore } from "../../stores/earningsStore";
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  ExternalLink,
  Info,
  CheckCircle2
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function VendorReferralsPage() {
  const { user } = useAuthStore();
  const { earnings } = useEarningsStore();
  const [showCopied, setShowCopied] = useState(false);

  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Earnings", to: "/vendor/earnings" },
    { label: "Referrals", to: "/vendor/referrals" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  const referralCode = (user as any)?.referralCode || "VENDOR-" + (user?.id?.substring(0, 6) || "ABCDEF");
  const referralEarnings = earnings.filter(e => e.type === "REFERRAL");
  const totalReferralAmount = referralEarnings.reduce((sum, e) => sum + e.netAmount, 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Kijayangu Vendor Network",
        text: `Use my referral code ${referralCode} to join Kenya's premier auto-parts marketplace!`,
        url: window.location.origin + "/register?ref=" + referralCode,
      });
    }
  };

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Referral Program</h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Invite vendors and earn from their success.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Referral Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-8 shadow-sm text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <Gift className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-dark-text">Give 0%, Get Paid</h2>
              <p className="mb-6 text-sm text-slate-600 dark:text-dark-textMuted max-w-md mx-auto">
                Share your referral code with other auto-parts vendors. When they join and make sales, you earn a percentage of our marketplace commission!
              </p>

              <div className="mx-auto max-w-sm space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between rounded-md border-2 border-dashed border-[#c8c8c8] bg-slate-50 dark:bg-dark-base px-6 py-4">
                    <span className="font-mono text-xl font-bold tracking-widest text-slate-900 dark:text-dark-text uppercase">
                      {referralCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      {showCopied ? <CheckCircle2 className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                    </button>
                  </div>
                  {showCopied && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-green-600">
                      Copied to clipboard!
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCopyCode} variant="outline" className="flex-1 gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button onClick={handleShare} className="flex-1 gap-2 bg-[#2b579a]">
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </Button>
                </div>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Referrals</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-dark-text">
                  {referralEarnings.length}
                </p>
              </div>
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">Pending Bonuses</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-dark-text">
                  0
                </p>
              </div>
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">LifeTime Earnings</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  KES {totalReferralAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Referral History */}
            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text">Referral History</h3>
              </div>
              <div className="p-0">
                {referralEarnings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-dark-base text-xs text-slate-500">
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Description</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold text-right">Bonus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                        {referralEarnings.map((e, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-dark-base">
                            <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                              {new Date(e.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                              Marketplace Referral Commission
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                {e.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">
                              +KES {e.netAmount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Users className="mb-3 h-12 w-12 text-slate-200" />
                    <p className="text-sm text-slate-500">No referral bonuses yet.</p>
                    <p className="text-xs text-slate-400">Share your code to start earning!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-dark-text">
                <Info className="h-4 w-4 text-[#2b579a]" />
                How it works
              </h3>
              <ul className="space-y-4 text-xs text-slate-600 dark:text-dark-textMuted">
                <li className="flex gap-3">
                   <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2b579a] text-[10px] text-white">1</div>
                   <span>Invite a vendor using your referral code.</span>
                </li>
                <li className="flex gap-3">
                   <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2b579a] text-[10px] text-white">2</div>
                   <span>The vendor signs up and starts selling auto parts on the platform.</span>
                </li>
                <li className="flex gap-3">
                   <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2b579a] text-[10px] text-white">3</div>
                   <span>You earn a commission bonus for every successful sale they complete.</span>
                </li>
              </ul>
              
              <div className="mt-6 rounded-sm bg-slate-50 dark:bg-dark-base p-4 text-[11px]">
                <p className="font-semibold text-slate-900 dark:text-dark-text mb-1 italic">Pro Tip:</p>
                <p className="text-slate-600 dark:text-dark-textMuted">
                  Successful vendors often share their links in WhatsApp groups and industry forums.
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-dark-text">
                <ExternalLink className="h-4 w-4 text-[#2b579a]" />
                Quick Links
              </h3>
              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-sm border border-[#c8c8c8] px-3 py-2 text-left text-xs hover:bg-slate-50">
                  Program Terms & Conditions
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button className="flex w-full items-center justify-between rounded-sm border border-[#c8c8c8] px-3 py-2 text-left text-xs hover:bg-slate-50">
                  Vendor Handbook
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
