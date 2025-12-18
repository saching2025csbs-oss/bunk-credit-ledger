import { useState, useEffect } from "react";
import { Car, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string | null;
}

interface VehicleManagementProps {
  customerId: string;
  isAdmin: boolean;
}

export function VehicleManagement({ customerId, isAdmin }: VehicleManagementProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("truck");
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, [customerId]);

  const fetchVehicles = async () => {
    try {
      const { data } = await supabase
        .from("vehicle_numbers")
        .select("id, vehicle_number, vehicle_type")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.trim()) {
      toast({
        title: "Error",
        description: "Enter vehicle number",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("vehicle_numbers").insert({
        customer_id: customerId,
        vehicle_number: newVehicle.toUpperCase().trim(),
        vehicle_type: newVehicleType,
      });

      if (error) throw error;

      toast({ title: "Vehicle added", description: "New vehicle registered" });
      setNewVehicle("");
      setShowAddForm(false);
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message?.includes("duplicate") 
          ? "Vehicle already exists" 
          : "Failed to add vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Delete this vehicle?")) return;

    try {
      const { error } = await supabase
        .from("vehicle_numbers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVehicles(prev => prev.filter(v => v.id !== id));
      toast({ title: "Deleted", description: "Vehicle removed" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading vehicles...</div>;
  }

  return (
    <div className="admin-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Registered Vehicles</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="admin-button-secondary text-sm py-1.5 px-3"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? "Cancel" : "Add"}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Vehicle Number (e.g., MH 12 AB 1234)"
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value.toUpperCase())}
              className="admin-input flex-1 font-mono"
            />
            <select
              value={newVehicleType}
              onChange={(e) => setNewVehicleType(e.target.value)}
              className="admin-select w-32"
            >
              <option value="truck">Truck</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={handleAddVehicle}
            className="admin-button-primary mt-3 w-full"
          >
            Add Vehicle
          </button>
        </div>
      )}

      {vehicles.length === 0 ? (
        <p className="text-muted-foreground text-sm">No vehicles registered</p>
      ) : (
        <div className="space-y-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-mono font-semibold text-foreground">
                    {vehicle.vehicle_number}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {vehicle.vehicle_type || "Unknown"}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
