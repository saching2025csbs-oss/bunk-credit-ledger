import { useState, FormEvent, useEffect } from "react";
import { Fuel, User, Car, IndianRupee, AlertTriangle, Plus, Check } from "lucide-react";
import { SuccessBanner } from "./SuccessBanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  credit_limit: number;
  currentOutstanding: number;
}

interface VehicleNumber {
  vehicle_number: string;
  customer_id: string;
  customer_name: string;
}

const fuelTypes = [
  { value: "petrol", label: "PETROL" },
  { value: "diesel", label: "DIESEL" },
  { value: "oil", label: "ENGINE OIL" },
];

export function StaffAddCreditForm() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<VehicleNumber[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);

  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchVehicles();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name, credit_limit");

      if (!customersData) return;

      const customersWithOutstanding: Customer[] = [];

      for (const customer of customersData) {
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("customer_id", customer.id);

        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("customer_id", customer.id);

        const totalTransactions = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        customersWithOutstanding.push({
          id: customer.id,
          name: customer.name,
          credit_limit: Number(customer.credit_limit),
          currentOutstanding: totalTransactions - totalPayments,
        });
      }

      setCustomers(customersWithOutstanding);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data } = await supabase
        .from("vehicle_numbers")
        .select(`
          vehicle_number, customer_id,
          customers(name)
        `);

      setVehicles(data?.map(v => ({
        vehicle_number: v.vehicle_number,
        customer_id: v.customer_id,
        customer_name: (v.customers as any)?.name || "Unknown",
      })) || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleVehicleChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setVehicleNumber(upperValue);

    // Filter matching vehicles
    if (upperValue.length >= 2) {
      const matches = vehicles.filter(v => 
        v.vehicle_number.toUpperCase().includes(upperValue)
      );
      setFilteredVehicles(matches);
      setShowVehicleSuggestions(matches.length > 0);
    } else {
      setShowVehicleSuggestions(false);
    }
  };

  const selectVehicle = (vehicle: VehicleNumber) => {
    setVehicleNumber(vehicle.vehicle_number);
    setCustomerId(vehicle.customer_id);
    setShowVehicleSuggestions(false);
    checkCreditLimit(vehicle.customer_id);
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber = "VEHICLE NUMBER REQUIRED";
    }
    if (!customerId) {
      newErrors.customerId = "SELECT CUSTOMER";
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "ENTER AMOUNT";
    }
    if (!fuelType) {
      newErrors.fuelType = "SELECT FUEL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCreditLimit = (custId?: string) => {
    const customer = customers.find(c => c.id === (custId || customerId));
    if (customer && amount) {
      const newTotal = customer.currentOutstanding + parseFloat(amount);
      if (newTotal > customer.credit_limit) {
        setCreditWarning(
          `⚠️ EXCEEDS LIMIT BY ₹${(newTotal - customer.credit_limit).toLocaleString()}`
        );
      } else {
        setCreditWarning(null);
      }
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setTimeout(() => checkCreditLimit(), 100);
  };

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setCreditWarning(null);
    setTimeout(() => checkCreditLimit(value), 100);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast({
        title: "ERROR",
        description: "ENTER CUSTOMER NAME",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .insert({ 
          name: newCustomerName.trim(),
          created_by: user?.id 
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      setCustomerId(data.id);
      setNewCustomerName("");
      setShowNewCustomer(false);
      
      toast({
        title: "✓ CUSTOMER CREATED",
        description: `${newCustomerName.toUpperCase()} ADDED`,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "ERROR",
        description: "FAILED TO CREATE CUSTOMER",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("transactions").insert({
        customer_id: customerId,
        vehicle_number: vehicleNumber.toUpperCase(),
        amount: parseFloat(amount),
        fuel_type: fuelType,
        created_by: user.id,
        staff_name: profile?.full_name || "Unknown",
      });

      if (error) throw error;

      // Add vehicle number if new
      await supabase.from("vehicle_numbers").upsert({
        customer_id: customerId,
        vehicle_number: vehicleNumber.toUpperCase(),
      }, { onConflict: "vehicle_number" });

      setShowSuccess(true);
      
      // Reset form
      setVehicleNumber("");
      setAmount("");
      setFuelType("");
      setCreditWarning(null);
      
      await fetchCustomers();
      await fetchVehicles();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "ERROR",
        description: "FAILED TO SAVE. TRY AGAIN.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SuccessBanner 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />
      
      <div className="min-h-screen bg-background p-4 pb-32">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">
            NEW CREDIT ENTRY
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Number with Auto-complete */}
          <div className="staff-card p-4 relative">
            <label className="text-primary text-xs font-bold tracking-widest mb-2 flex items-center gap-2">
              <Car className="w-5 h-5" strokeWidth={3} />
              VEHICLE NUMBER
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => handleVehicleChange(e.target.value)}
              onFocus={() => vehicleNumber.length >= 2 && setShowVehicleSuggestions(filteredVehicles.length > 0)}
              placeholder="MH 12 AB 1234"
              className="staff-input"
            />
            {errors.vehicleNumber && (
              <p className="text-destructive font-bold text-sm mt-2">{errors.vehicleNumber}</p>
            )}
            
            {/* Vehicle Suggestions */}
            {showVehicleSuggestions && (
              <div className="absolute left-4 right-4 top-full mt-2 bg-card border-[3px] border-primary z-50 max-h-48 overflow-y-auto">
                {filteredVehicles.map((v) => (
                  <button
                    key={v.vehicle_number}
                    type="button"
                    onClick={() => selectVehicle(v)}
                    className="w-full px-4 py-3 text-left hover:bg-primary hover:text-primary-foreground border-b border-primary/30 last:border-0"
                  >
                    <p className="font-mono font-bold text-lg">{v.vehicle_number}</p>
                    <p className="text-sm text-muted-foreground">{v.customer_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Selection */}
          <div className="staff-card p-4">
            <label className="text-primary text-xs font-bold tracking-widest mb-2 flex items-center gap-2">
              <User className="w-5 h-5" strokeWidth={3} />
              CUSTOMER (KHATA)
            </label>
            
            {!showNewCustomer ? (
              <>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="staff-select"
                >
                  <option value="">-- SELECT CUSTOMER --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name.toUpperCase()} (₹{c.currentOutstanding.toLocaleString()} DUE)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(true)}
                  className="mt-3 text-primary font-bold text-sm flex items-center gap-1"
                >
                  <Plus className="w-5 h-5" strokeWidth={3} /> ADD NEW CUSTOMER
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="CUSTOMER NAME"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="staff-input"
                />
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={handleCreateCustomer}
                    className="staff-button-success py-3 px-4 text-base"
                  >
                    <Check className="w-5 h-5" strokeWidth={3} /> CREATE
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewCustomer(false)}
                    className="staff-button bg-secondary text-secondary-foreground border-primary py-3 px-4 text-base"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
            
            {errors.customerId && (
              <p className="text-destructive font-bold text-sm mt-2">{errors.customerId}</p>
            )}

            {selectedCustomer && (
              <div className="mt-3 p-3 bg-secondary border-[3px] border-primary/50">
                <p className="text-sm font-bold">
                  LIMIT: <span className="font-mono text-primary">₹{selectedCustomer.credit_limit.toLocaleString()}</span>
                </p>
                <p className="text-sm font-bold">
                  DUE: <span className="font-mono text-warning">₹{selectedCustomer.currentOutstanding.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className={`staff-card p-4 ${creditWarning ? 'border-warning bg-warning/10' : ''}`}>
            <label className="text-primary text-xs font-bold tracking-widest mb-2 flex items-center gap-2">
              <IndianRupee className="w-5 h-5" strokeWidth={3} />
              AMOUNT (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="staff-input text-3xl"
            />
            {errors.amount && (
              <p className="text-destructive font-bold text-sm mt-2">{errors.amount}</p>
            )}
            {creditWarning && (
              <div className="mt-3 p-3 bg-warning border-[3px] border-warning flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-warning-foreground flex-shrink-0" strokeWidth={3} />
                <p className="font-bold text-warning-foreground">{creditWarning}</p>
              </div>
            )}
          </div>

          {/* Fuel Type - Large Buttons */}
          <div className="staff-card p-4">
            <label className="text-primary text-xs font-bold tracking-widest mb-3 flex items-center gap-2">
              <Fuel className="w-5 h-5" strokeWidth={3} />
              FUEL TYPE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {fuelTypes.map((fuel) => (
                <button
                  key={fuel.value}
                  type="button"
                  onClick={() => setFuelType(fuel.value)}
                  className={`py-4 font-bold text-sm border-[3px] transition-all ${
                    fuelType === fuel.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-[4px_4px_0_hsl(var(--foreground))]'
                      : 'bg-secondary text-secondary-foreground border-primary/50 hover:border-primary'
                  }`}
                >
                  {fuel.label}
                </button>
              ))}
            </div>
            {errors.fuelType && (
              <p className="text-destructive font-bold text-sm mt-2">{errors.fuelType}</p>
            )}
          </div>

          {/* Submit Button - Fixed at bottom */}
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t-[3px] border-primary">
            <button 
              type="submit" 
              disabled={isLoading}
              className="staff-button-success w-full text-2xl py-5 disabled:opacity-50"
            >
              {isLoading ? "SAVING..." : "💾 SAVE ENTRY"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
