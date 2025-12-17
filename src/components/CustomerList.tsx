import { MessageCircle, FileText, ChevronRight } from "lucide-react";
import { NeoCard } from "./ui/NeoCard";
import { NeoButton } from "./ui/NeoButton";
import { NeoBadge } from "./ui/NeoBadge";

interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicles: string[];
  creditLimit: number;
  currentOutstanding: number;
  lastTransaction: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "ABC Transport",
    phone: "9876543210",
    vehicles: ["MH 12 AB 1234", "MH 12 CD 5678"],
    creditLimit: 50000,
    currentOutstanding: 42000,
    lastTransaction: "Today, 2:30 PM",
  },
  {
    id: "2",
    name: "Sharma Logistics",
    phone: "9876543211",
    vehicles: ["MH 14 XY 9999", "MH 14 ZZ 8888", "MH 14 AA 7777"],
    creditLimit: 100000,
    currentOutstanding: 35000,
    lastTransaction: "Yesterday, 5:45 PM",
  },
  {
    id: "3",
    name: "Patel Brothers",
    phone: "9876543212",
    vehicles: ["GJ 01 AB 1111"],
    creditLimit: 30000,
    currentOutstanding: 28500,
    lastTransaction: "Dec 15, 11:20 AM",
  },
];

function getStatusBadge(outstanding: number, limit: number) {
  const percentage = (outstanding / limit) * 100;
  if (percentage >= 100) {
    return <NeoBadge variant="destructive">OVER LIMIT</NeoBadge>;
  } else if (percentage >= 80) {
    return <NeoBadge variant="warning">NEAR LIMIT</NeoBadge>;
  }
  return <NeoBadge variant="success">OK</NeoBadge>;
}

function openWhatsApp(phone: string, name: string, amount: number) {
  const message = encodeURIComponent(
    `Hello, your outstanding bill for December is ₹${amount.toLocaleString()}. Please pay via UPI. Thank you! - BunkCredit`
  );
  window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
}

export function CustomerList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold uppercase tracking-wide">Customer Khata</h2>
        <NeoButton variant="primary" size="sm">
          + Add Customer
        </NeoButton>
      </div>

      {mockCustomers.map((customer) => (
        <NeoCard key={customer.id} hoverable className="p-0 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{customer.name}</h3>
                <p className="text-sm text-muted-foreground">{customer.lastTransaction}</p>
              </div>
              {getStatusBadge(customer.currentOutstanding, customer.creditLimit)}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {customer.vehicles.map((vehicle) => (
                <span
                  key={vehicle}
                  className="px-2 py-1 bg-secondary border-[2px] border-foreground font-mono text-sm font-bold"
                >
                  {vehicle}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary border-[2px] border-foreground -mx-4 -mb-4 mt-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="font-mono text-2xl font-bold">
                  ₹{customer.currentOutstanding.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Limit: ₹{customer.creditLimit.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openWhatsApp(customer.phone, customer.name, customer.currentOutstanding)}
                  className="w-12 h-12 bg-success border-[2px] border-foreground flex items-center justify-center hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all"
                  title="Send WhatsApp Reminder"
                >
                  <MessageCircle className="w-6 h-6 text-success-foreground" strokeWidth={3} />
                </button>
                <button
                  className="w-12 h-12 bg-primary border-[2px] border-foreground flex items-center justify-center hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all"
                  title="Generate Bill"
                >
                  <FileText className="w-6 h-6" strokeWidth={3} />
                </button>
                <button
                  className="w-12 h-12 bg-card border-[2px] border-foreground flex items-center justify-center hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all"
                  title="View Details"
                >
                  <ChevronRight className="w-6 h-6" strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </NeoCard>
      ))}
    </div>
  );
}
