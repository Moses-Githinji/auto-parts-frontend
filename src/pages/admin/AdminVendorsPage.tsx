import { useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "suspended";
  products: number;
  joinedDate: string;
}

export function AdminVendorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "VND-001",
      name: "AutoCare Plus",
      email: "contact@autocareplus.com",
      phone: "+254 712 345 678",
      status: "pending",
      products: 24,
      joinedDate: "Jan 15, 2024",
    },
    {
      id: "VND-002",
      name: "MotorParts KE",
      email: "info@motorparts.co.ke",
      phone: "+254 723 456 789",
      status: "active",
      products: 156,
      joinedDate: "Dec 10, 2023",
    },
    {
      id: "VND-003",
      name: "SparePro Ltd",
      email: "support@sparepro.co.ke",
      phone: "+254 734 567 890",
      status: "suspended",
      products: 0,
      joinedDate: "Nov 5, 2023",
    },
  ]);

  const [newVendor, setNewVendor] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    status: "ACTIVE",
    sendCredentialsEmail: true,
  });

  const navItems = [
    { label: "Dashboard", to: "/admin" },
    { label: "Vendors", to: "/admin/vendors" },
    { label: "Disputes", to: "/admin/disputes" },
    { label: "Reports", to: "/admin/reports" },
  ];

  const handleAddVendor = () => {
    setIsModalOpen(true);
  };

  const handleSubmitVendor = (e: React.FormEvent) => {
    e.preventDefault();
    // Create new vendor (for demo purposes - in production, this would call the API)
    const vendor: Vendor = {
      id: `VND-${String(vendors.length + 1).padStart(3, "0")}`,
      name: newVendor.companyName,
      email: newVendor.email,
      phone: newVendor.phone,
      status: "pending",
      products: 0,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    // Prepare API payload according to backend specification
    const vendorPayload = {
      email: newVendor.email,
      companyName: newVendor.companyName,
      contactName: newVendor.contactName || undefined,
      phone: newVendor.phone || undefined,
      address: newVendor.address || undefined,
      city: newVendor.city || undefined,
      state: newVendor.state || undefined,
      zipCode: newVendor.zipCode || undefined,
      description: newVendor.description || undefined,
      status: newVendor.status,
      sendCredentialsEmail: newVendor.sendCredentialsEmail,
    };

    console.log("Creating vendor with payload:", vendorPayload);

    setVendors([...vendors, vendor]);
    setNewVendor({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      description: "",
      status: "ACTIVE",
      sendCredentialsEmail: true,
    });
    setIsModalOpen(false);
    alert(
      `Vendor "${vendor.name}" added successfully!\nCredentials will be sent to ${newVendor.email}`,
    );
  };

  const handleReviewVendor = (vendorId: string) => {
    alert(`Reviewing vendor ${vendorId}`);
  };

  const handleViewVendor = (vendorId: string) => {
    alert(`Viewing vendor ${vendorId}`);
  };

  const handleEditVendor = (vendorId: string) => {
    alert(`Editing vendor ${vendorId}`);
  };

  return (
    <BackofficeLayout title="Admin Console" navItems={navItems}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Vendors</h1>
            <p className="text-sm text-slate-600">
              Manage vendor accounts and KYC verification.
            </p>
          </div>
          <button
            onClick={handleAddVendor}
            className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
          >
            Add Vendor
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search vendors..."
            className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          />
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending KYC</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Vendors Table */}
        <div className="rounded-sm border border-[#c8c8c8]">
          <table className="w-full text-xs">
            <thead className="bg-[#f3f3f3]">
              <tr className="border-b border-[#c8c8c8]">
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Vendor
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Contact
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Products
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Joined
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="border-b border-[#e8e8e8] hover:bg-[#f8f8f8]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {vendor.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ID: {vendor.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{vendor.email}</p>
                    <p className="text-[10px] text-slate-500">{vendor.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        vendor.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : vendor.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vendor.status === "pending"
                        ? "Pending KYC"
                        : vendor.status.charAt(0).toUpperCase() +
                          vendor.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {vendor.products}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {vendor.joinedDate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {vendor.status === "pending" ? (
                        <button
                          onClick={() => handleReviewVendor(vendor.id)}
                          className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewVendor(vendor.id)}
                          className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                        >
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleEditVendor(vendor.id)}
                        className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing 1-{vendors.length} of {vendors.length} vendors
          </span>
          <div className="flex gap-1">
            <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-xs hover:bg-[#f3f3f3]">
              Previous
            </button>
            <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-xs hover:bg-[#f3f3f3]">
              Next
            </button>
          </div>
        </div>

        {/* Add Vendor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Add New Vendor
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitVendor} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVendor.companyName}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        companyName: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={newVendor.contactName}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, email: e.target.value })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newVendor.phone}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, phone: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newVendor.address}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, address: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={newVendor.city}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, city: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      State/County
                    </label>
                    <input
                      type="text"
                      value={newVendor.state}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, state: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={newVendor.zipCode}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, zipCode: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter zip code"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      value={newVendor.status}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, status: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={newVendor.description}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter vendor description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendCredentials"
                    checked={newVendor.sendCredentialsEmail}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        sendCredentialsEmail: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#c8c8c8] text-[#2b579a] focus:ring-[#2b579a]"
                  />
                  <label
                    htmlFor="sendCredentials"
                    className="text-xs text-slate-700"
                  >
                    Send credentials email to vendor
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
                  >
                    Add Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
