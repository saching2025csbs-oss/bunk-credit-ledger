import { useState, FormEvent } from "react";
import { Fuel, User, Car, IndianRupee, Camera, AlertTriangle } from "lucide-react";
import { NeoButton } from "./ui/NeoButton";
import { NeoInput } from "./ui/NeoInput";
import { NeoSelect } from "./ui/NeoSelect";
import { NeoCard } from "./ui/NeoCard";
import { SuccessBanner } from "./SuccessBanner";

interface Customer {
  id: string;
  name: string;
  creditLimit: number;
  currentOutstanding: number;
}

// Mock customer data
const mockCustomers: Customer[] = [
  { id: "1", name: "ABC Transport", creditLimit: 50000, currentOutstanding: 42000 },
  { id: "2", name: "Sharma Logistics", creditLimit: 100000, currentOutstanding: 35000 },
  { id: "3", name: "Patel Brothers", creditLimit: 30000, currentOutstanding: 28500 },
  { id: "4", name: "Singh Enterprises", creditLimit: 75000, currentOutstanding: 15000 },
];

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);

  const selectedCustomer = mockCustomers.find(c => c.id === customerId);

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
      if (newTotal > selectedCustomer.creditLimit) {
        setCreditWarning(
          `Warning! This will exceed ${selectedCustomer.name}'s credit limit by ₹${(newTotal - selectedCustomer.creditLimit).toLocaleString()}`
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate saving
      setShowSuccess(true);
      
      // Reset form
      setVehicleNumber("");
      setCustomerId("");
      setAmount("");
      setFuelType("");
      setCreditWarning(null);
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary border-[3px] border-foreground flex items-center justify-center shadow-neo-sm">
              <Fuel className="w-7 h-7" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">BunkCredit</h1>
              <p className="text-sm text-muted-foreground font-medium">Add New Credit Entry</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vehicle Number */}
          <NeoCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-[2px] border-foreground flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5" strokeWidth={3} />
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
              <div className="w-10 h-10 bg-secondary border-[2px] border-foreground flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <NeoSelect
                  id="customer"
                  label="Customer (Khata)"
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  error={errors.customerId}
                  options={[
                    { value: "", label: "Select Customer" },
                    ...mockCustomers.map(c => ({
                      value: c.id,
                      label: `${c.name} (₹${c.currentOutstanding.toLocaleString()} due)`
                    }))
                  ]}
                />
                {selectedCustomer && (
                  <div className="mt-2 p-2 bg-secondary border-[2px] border-foreground">
                    <p className="text-sm font-medium">
                      Credit Limit: <span className="font-mono font-bold">₹{selectedCustomer.creditLimit.toLocaleString()}</span>
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
              <div className="w-10 h-10 bg-primary border-[2px] border-foreground flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-5 h-5" strokeWidth={3} />
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
                  <div className="mt-3 p-3 bg-warning border-[2px] border-foreground flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <p className="font-bold text-sm">{creditWarning}</p>
                  </div>
                )}
              </div>
            </div>
          </NeoCard>

          {/* Fuel Type */}
          <NeoCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-[2px] border-foreground flex items-center justify-center flex-shrink-0">
                <Fuel className="w-5 h-5" strokeWidth={3} />
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

          {/* Driver Photo (Optional) */}
          <NeoCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-[2px] border-foreground flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <label className="block mb-2 font-bold text-foreground uppercase tracking-wide">
                  Driver Photo (Optional)
                </label>
                <label className="neo-button neo-button-secondary w-full cursor-pointer text-center block">
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                  <input type="file" accept="image/*" capture="environment" className="hidden" />
                </label>
              </div>
            </div>
          </NeoCard>

          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t-[3px] border-foreground">
            <NeoButton 
              type="submit" 
              variant="success" 
              size="lg" 
              className="w-full text-xl"
            >
              💾 SAVE CREDIT ENTRY
            </NeoButton>
          </div>
        </form>
      </div>
    </>
  );
}
