import { useState, FormEvent, useEffect } from "react";
import { Fuel, User, Car, IndianRupee, Camera, AlertTriangle, Plus } from "lucide-react";
import { NeoButton } from "./ui/NeoButton";
import { NeoInput } from "./ui/NeoInput";
import { NeoSelect } from "./ui/NeoSelect";
import { NeoCard } from "./ui/NeoCard";
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

const fuelTypes = [
  { value: "", label: "Select Fuel Type" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "oil", label: "Engine Oil" },
];

export function AddCreditForm() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
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

  const selectedCustomer = customers.find(c => c.id === customerId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    }
    if (!customerId) {
      newErrors.customerId = "Please select a customer";
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Enter a valid amount";
    }
    if (!fuelType) {
      newErrors.fuelType = "Please select fuel type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCreditLimit = () => {
    if (selectedCustomer && amount) {
      const newTotal = selectedCustomer.currentOutstanding + parseFloat(amount);
      if (newTotal > selectedCustomer.credit_limit) {
        setCreditWarning(
          `Warning! This will exceed ${selectedCustomer.name}'s credit limit by ₹${(newTotal - selectedCustomer.credit_limit).toLocaleString()}`
        );
      } else {
        setCreditWarning(null);
      }
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setTimeout(checkCreditLimit, 100);
  };

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setCreditWarning(null);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a customer name",
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
        title: "Customer Created",
        description: `${newCustomerName} has been added.`,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "Failed to create customer",
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
        notes: notes || null,
        created_by: user.id,
        staff_name: profile?.full_name || "Unknown",
      });

      if (error) throw error;

      // Also add vehicle number if it doesn't exist
      await supabase.from("vehicle_numbers").upsert({
        customer_id: customerId,
        vehicle_number: vehicleNumber.toUpperCase(),
      }, { onConflict: "vehicle_number" });

      setShowSuccess(true);
      
      // Reset form
      setVehicleNumber("");
      setAmount("");
      setFuelType("");
      setNotes("");
      setCreditWarning(null);
      
      // Refresh customer data
      fetchCustomers();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
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
      
      <div className="min-h-screen bg-background p-4 pb-24">
        <header className="mb-6">
          <h2 className="text-2xl font-bold mb-1">New Credit Entry</h2>
          <p className="text-muted-foreground font-medium">Record a new fuel credit transaction</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vehicle Number */}
          <NeoCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-[2px] border-primary/40 flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-primary" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <NeoInput
                  id="vehicleNumber"
                  label="Vehicle Number"
                  placeholder="MH 12 AB 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  error={errors.vehicleNumber}
                  className="font-mono text-xl tracking-widest"
                />
              </div>
            </div>
          </NeoCard>

          {/* Customer Selection */}
          <NeoCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-[2px] border-primary/40 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" strokeWidth={3} />
              </div>
              <div className="flex-1">
                {!showNewCustomer ? (
                  <>
                    <NeoSelect
                      id="customer"
                      label="Customer (Khata)"
                      value={customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      error={errors.customerId}
                      options={[
                        { value: "", label: "Select Customer" },
                        ...customers.map(c => ({
                          value: c.id,
                          label: `${c.name} (₹${c.currentOutstanding.toLocaleString()} due)`
                        }))
                      ]}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewCustomer(true)}
                      className="mt-2 text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Add New Customer
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <NeoInput
                      id="newCustomerName"
                      label="New Customer Name"
                      placeholder="Enter customer name"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <NeoButton type="button" variant="success" size="sm" onClick={handleCreateCustomer}>
                        Create
                      </NeoButton>
                      <NeoButton type="button" variant="ghost" size="sm" onClick={() => setShowNewCustomer(false)}>
                        Cancel
                      </NeoButton>
                    </div>
                  </div>
                )}
                
                {selectedCustomer && (
                  <div className="mt-2 p-2 bg-secondary border-[2px] border-primary/40">
                    <p className="text-sm font-medium">
                      Credit Limit: <span className="font-mono font-bold text-primary">₹{selectedCustomer.credit_limit.toLocaleString()}</span>
                    </p>
                    <p className="text-sm font-medium">
                      Outstanding: <span className="font-mono font-bold text-warning">₹{selectedCustomer.currentOutstanding.toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </NeoCard>

          {/* Amount */}
          <NeoCard className={creditWarning ? "warning-pulse" : ""}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary border-[2px] border-primary flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <NeoInput
                  id="amount"
                  label="Fuel Amount (₹)"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  error={errors.amount}
                  className="font-mono text-2xl"
                />
                {creditWarning && (
                  <div className="mt-3 p-3 bg-warning border-[2px] border-warning flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-warning-foreground" strokeWidth={3} />
                    <p className="font-bold text-sm text-warning-foreground">{creditWarning}</p>
                  </div>
                )}
              </div>
            </div>
          </NeoCard>

          {/* Fuel Type */}
          <NeoCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-[2px] border-primary/40 flex items-center justify-center flex-shrink-0">
                <Fuel className="w-5 h-5 text-primary" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <NeoSelect
                  id="fuelType"
                  label="Fuel Type"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  error={errors.fuelType}
                  options={fuelTypes}
                />
              </div>
            </div>
          </NeoCard>

          {/* Notes */}
          <NeoCard>
            <NeoInput
              id="notes"
              label="Notes (Optional)"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </NeoCard>

          {/* Submit Button */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t-[3px] border-primary/40">
            <NeoButton 
              type="submit" 
              variant="success" 
              size="lg" 
              className="w-full text-xl"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "💾 SAVE CREDIT ENTRY"}
            </NeoButton>
          </div>
        </form>
      </div>
    </>
  );
}
