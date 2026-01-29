export function VendorDashboardPage() {
  return (
    <div className="space-y-3 text-xs">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          Vendor dashboard
        </h1>
        <p className="text-[11px] text-slate-600">
          Overview of orders, catalog, and SLA metrics (mocked UI).
        </p>
      </header>
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-600">Orders to fulfill today</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">3</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-600">On-time shipment rate</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">98%</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-600">Cancellation rate</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">1.2%</p>
        </div>
      </section>
    </div>
  );
}
