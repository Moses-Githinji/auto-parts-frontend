export function AdminDashboardPage() {
  return (
    <div className="space-y-3 text-xs">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Admin console</h1>
        <p className="text-[11px] text-slate-600">
          Monitor vendor onboarding, catalog moderation, and trust &amp; safety.
        </p>
      </header>
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-600">Vendors pending KYC</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">5</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-600">
            Catalog changes awaiting review
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">12</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-600">Open disputes</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">3</p>
        </div>
      </section>
    </div>
  );
}
