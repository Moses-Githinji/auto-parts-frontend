import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { apiClient } from "../../lib/apiClient";
import { notify } from "../../stores/notificationStore";
import type {
  VehicleMake,
  VehicleModel,
  VehicleYear,
} from "../../types/vehicle";

interface UserVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  transmission?: string;
  isDefault: boolean;
}

interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  engine?: string;
  transmission?: string;
  isDefault?: boolean;
}

// Sample data for dropdowns
const makes: VehicleMake[] = [
  { id: "m1", name: "Toyota", createdAt: "2024-01-01" },
  { id: "m2", name: "Honda", createdAt: "2024-01-01" },
  { id: "m3", name: "Nissan", createdAt: "2024-01-01" },
  { id: "m4", name: "Ford", createdAt: "2024-01-01" },
  { id: "m5", name: "Mazda", createdAt: "2024-01-01" },
];

const models: Record<string, VehicleModel[]> = {
  Toyota: [
    { id: "mo1", makeId: "m1", name: "Corolla", createdAt: "2024-01-01" },
    { id: "mo2", makeId: "m1", name: "Camry", createdAt: "2024-01-01" },
    { id: "mo3", makeId: "m1", name: "RAV4", createdAt: "2024-01-01" },
  ],
  Honda: [
    { id: "mo4", makeId: "m2", name: "Civic", createdAt: "2024-01-01" },
    { id: "mo5", makeId: "m2", name: "Accord", createdAt: "2024-01-01" },
    { id: "mo6", makeId: "m2", name: "CR-V", createdAt: "2024-01-01" },
  ],
  Nissan: [
    { id: "mo7", makeId: "m3", name: "Sentra", createdAt: "2024-01-01" },
    { id: "mo8", makeId: "m3", name: "Altima", createdAt: "2024-01-01" },
  ],
  Ford: [
    { id: "mo9", makeId: "m4", name: "Fiesta", createdAt: "2024-01-01" },
    { id: "mo10", makeId: "m4", name: "Focus", createdAt: "2024-01-01" },
  ],
  Mazda: [
    { id: "mo11", makeId: "m5", name: "Mazda3", createdAt: "2024-01-01" },
    { id: "mo12", makeId: "m5", name: "Mazda6", createdAt: "2024-01-01" },
  ],
};

const years: VehicleYear[] = Array.from({ length: 25 }, (_, i) => ({
  id: `y${2024 - i}`,
  year: 2024 - i,
  createdAt: "2024-01-01",
}));

export function AccountGarage() {
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<CreateVehicleRequest>({
    make: "",
    model: "",
    year: 2024,
    engine: "",
    transmission: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ vehicles: UserVehicle[] }>(
        "/api/users/vehicles"
      );
      setVehicles(response.vehicles || []);
    } catch (err) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to fetch vehicles"
      );
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (newVehicle.make && newVehicle.model && newVehicle.year) {
      try {
        await apiClient.post("/api/users/vehicles", newVehicle);
        await fetchVehicles();
        setNewVehicle({
          make: "",
          model: "",
          year: 2024,
          engine: "",
          transmission: "",
          isDefault: false,
        });
        setIsAddingVehicle(false);
        notify.success(
          "Vehicle added",
          "Your vehicle has been added to your garage"
        );
      } catch (err) {
        console.error("Error adding vehicle:", err);
        notify.error("Failed to add vehicle", "Please try again");
      }
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await apiClient.delete(`/api/users/vehicles/${id}`);
      notify.success(
        "Vehicle deleted",
        "Your vehicle has been removed from your garage"
      );
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      notify.error("Failed to delete vehicle", "Please try again");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.patch(`/api/users/vehicles/${id}`, { isDefault: true });
      notify.success(
        "Default vehicle set",
        "Your default vehicle has been updated"
      );
    } catch (err) {
      console.error("Error setting default vehicle:", err);
      notify.error("Failed to set default vehicle", "Please try again");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">My Garage</h1>
            <p className="text-xs text-slate-600">
              Manage your saved vehicles for quick fitment checking
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">My Garage</h1>
            <p className="text-xs text-slate-600">
              Manage your saved vehicles for quick fitment checking
            </p>
          </div>
        </div>
        <div className="rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchVehicles}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">My Garage</h1>
          <p className="text-xs text-slate-600">
            Manage your saved vehicles for quick fitment checking
          </p>
        </div>
        <Button
          className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
          onClick={() => setIsAddingVehicle(true)}
        >
          Add Vehicle
        </Button>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="rounded-sm border border-[#c8c8c8] bg-white p-6 text-center">
          <p className="text-sm text-slate-600">No vehicles saved yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Add your vehicles to see compatible parts
          </p>
          <Button
            className="mt-3 bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
            onClick={() => setIsAddingVehicle(true)}
          >
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`rounded-sm border bg-white p-4 shadow-sm ${
                vehicle.isDefault
                  ? "border-[#FF9900] ring-1 ring-[#FF9900]"
                  : "border-[#c8c8c8]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </span>
                    {vehicle.isDefault && (
                      <Badge className="bg-[#FF9900] text-white">Default</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {vehicle.engine || "Engine not specified"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {vehicle.transmission || "Transmission not specified"}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!vehicle.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px]"
                      onClick={() => handleSetDefault(vehicle.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    (window.location.href = `/search?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}`)
                  }
                >
                  Browse Parts
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Add Vehicle
              </h2>
              <button
                onClick={() => setIsAddingVehicle(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Make
                </label>
                <select
                  value={newVehicle.make}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      make: e.target.value,
                      model: "",
                    })
                  }
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                >
                  <option value="">Select Make</option>
                  {makes.map((make) => (
                    <option key={make.id} value={make.name}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Model
                </label>
                <select
                  value={newVehicle.model}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, model: e.target.value })
                  }
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                  disabled={!newVehicle.make}
                >
                  <option value="">Select Model</option>
                  {(models[newVehicle.make] || []).map((model) => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Year
                </label>
                <select
                  value={newVehicle.year}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                >
                  {years.map((year) => (
                    <option key={year.id} value={year.year.toString()}>
                      {year.year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Engine (Optional)
                </label>
                <input
                  type="text"
                  value={newVehicle.engine || ""}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, engine: e.target.value })
                  }
                  placeholder="e.g., 1.8L 4-Cylinder"
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Transmission (Optional)
                </label>
                <select
                  value={newVehicle.transmission || ""}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      transmission: e.target.value,
                    })
                  }
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                >
                  <option value="">Select Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingVehicle(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
                  onClick={handleAddVehicle}
                  disabled={
                    !newVehicle.make || !newVehicle.model || !newVehicle.year
                  }
                >
                  Add Vehicle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-sm bg-blue-50 p-4">
        <h3 className="text-xs font-semibold text-blue-900">
          Why add your vehicles?
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-blue-800">
          <li>• See only parts that fit your specific vehicle</li>
          <li>• Get personalized recommendations based on your garage</li>
          <li>• Save time searching for compatible parts</li>
        </ul>
      </div>
    </div>
  );
}
