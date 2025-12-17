import { Fuel, Droplet, Car } from "lucide-react";
import { NeoCard } from "./ui/NeoCard";
import { NeoBadge } from "./ui/NeoBadge";

interface Transaction {
  id: string;
  vehicleNumber: string;
  customerName: string;
  amount: number;
  fuelType: "petrol" | "diesel" | "oil";
  timestamp: string;
  staffName: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    vehicleNumber: "MH 12 AB 1234",
    customerName: "ABC Transport",
    amount: 2500,
    fuelType: "diesel",
    timestamp: "Today, 2:30 PM",
    staffName: "Ramesh",
  },
  {
    id: "2",
    vehicleNumber: "MH 14 XY 9999",
    customerName: "Sharma Logistics",
    amount: 4200,
    fuelType: "diesel",
    timestamp: "Today, 1:15 PM",
    staffName: "Suresh",
  },
  {
    id: "3",
    vehicleNumber: "GJ 01 AB 1111",
    customerName: "Patel Brothers",
    amount: 1800,
    fuelType: "petrol",
    timestamp: "Today, 11:45 AM",
    staffName: "Ramesh",
  },
  {
    id: "4",
    vehicleNumber: "MH 12 CD 5678",
    customerName: "ABC Transport",
    amount: 350,
    fuelType: "oil",
    timestamp: "Today, 10:00 AM",
    staffName: "Suresh",
  },
];

function getFuelIcon(fuelType: string) {
  switch (fuelType) {
    case "diesel":
      return <Droplet className="w-4 h-4" strokeWidth={3} />;
    case "oil":
      return <Car className="w-4 h-4" strokeWidth={3} />;
    default:
      return <Fuel className="w-4 h-4" strokeWidth={3} />;
  }
}

function getFuelBadgeVariant(fuelType: string): "primary" | "warning" | "default" {
  switch (fuelType) {
    case "diesel":
      return "warning";
    case "petrol":
      return "primary";
    default:
      return "default";
  }
}

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold uppercase tracking-wide">Today's Transactions</h2>
      
      <div className="space-y-3">
        {mockTransactions.map((transaction, index) => (
          <NeoCard 
            key={transaction.id} 
            className="p-3 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary border-[2px] border-foreground flex items-center justify-center">
                  {getFuelIcon(transaction.fuelType)}
                </div>
                <div>
                  <p className="font-mono font-bold text-lg tracking-wider">
                    {transaction.vehicleNumber}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {transaction.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.timestamp} • by {transaction.staffName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-bold">
                  ₹{transaction.amount.toLocaleString()}
                </p>
                <NeoBadge variant={getFuelBadgeVariant(transaction.fuelType)}>
                  {transaction.fuelType}
                </NeoBadge>
              </div>
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
