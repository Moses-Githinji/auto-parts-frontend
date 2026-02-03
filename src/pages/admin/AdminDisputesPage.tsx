import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";

export function AdminDisputesPage() {
  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Disputes</h1>
            <p className="text-sm text-slate-600">
              Manage and resolve customer disputes.
            </p>
          </div>
          <button className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]">
            Export Report
          </button>
        </div>

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Open Disputes</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">3</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Under Review</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">2</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Resolved (This Week)</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">5</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Avg. Resolution Time</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              2.5 days
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search disputes..."
            className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          />
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Disputes List */}
        <div className="space-y-4">
          {/* Dispute 1 */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700">
                  #
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      DSP-2024-001
                    </h3>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                      High Priority
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      Open
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Customer claims received wrong item - ordered brake pads but
                    received oil filter
                  </p>
                  <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
                    <span>Customer: John Doe</span>
                    <span>Vendor: AutoCare Plus</span>
                    <span>Order: #1234</span>
                    <span>Opened: Jan 25, 2024</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-sm border border-[#c8c8c8] px-3 py-1 text-xs hover:bg-[#f3f3f3]">
                  View Details
                </button>
                <button className="rounded-sm bg-[#2b579a] px-3 py-1 text-xs text-white hover:bg-[#1e3f7a]">
                  Take Action
                </button>
              </div>
            </div>
          </div>

          {/* Dispute 2 */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                  #
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      DSP-2024-002
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      Medium Priority
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      Under Review
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Refund requested for damaged part - product arrived with
                    visible dents
                  </p>
                  <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
                    <span>Customer: Jane Smith</span>
                    <span>Vendor: MotorParts KE</span>
                    <span>Order: #1235</span>
                    <span>Opened: Jan 23, 2024</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-sm border border-[#c8c8c8] px-3 py-1 text-xs hover:bg-[#f3f3f3]">
                  View Details
                </button>
                <button className="rounded-sm bg-[#2b579a] px-3 py-1 text-xs text-white hover:bg-[#1e3f7a]">
                  Continue Review
                </button>
              </div>
            </div>
          </div>

          {/* Dispute 3 */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  #
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      DSP-2024-003
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      Low Priority
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      Under Review
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Delivery delay complaint - package took 2 weeks to arrive
                  </p>
                  <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
                    <span>Customer: Bob Wilson</span>
                    <span>Vendor: SparePro Ltd</span>
                    <span>Order: #1236</span>
                    <span>Opened: Jan 20, 2024</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-sm border border-[#c8c8c8] px-3 py-1 text-xs hover:bg-[#f3f3f3]">
                  View Details
                </button>
                <button className="rounded-sm bg-[#2b579a] px-3 py-1 text-xs text-white hover:bg-[#1e3f7a]">
                  Continue Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
