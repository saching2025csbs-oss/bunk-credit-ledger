import { useState, useEffect } from "react";
import { MessageCircle, FileText, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NeoCard } from "./ui/NeoCard";
import { NeoButton } from "./ui/NeoButton";
import { NeoBadge } from "./ui/NeoBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  credit_limit: number;
  currentOutstanding: number;
  vehicles: string[];
  lastTransaction: string | null;
}

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
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hello, your outstanding bill for December is ₹${amount.toLocaleString()}. Please pay via UPI. Thank you! - BunkCredit`
  );
  window.open(`https://wa.me/91${cleanPhone}?text=${message}`, "_blank");
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name, phone, credit_limit");

      if (!customersData) return;

      const customersWithDetails: Customer[] = [];

      for (const customer of customersData) {
        // Get vehicles
        const { data: vehicles } = await supabase
          .from("vehicle_numbers")
          .select("vehicle_number")
          .eq("customer_id", customer.id);

        // Get transactions sum
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, created_at")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        // Get payments sum
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("customer_id", customer.id);

        const totalTransactions = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        customersWithDetails.push({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          credit_limit: Number(customer.credit_limit),
          currentOutstanding: totalTransactions - totalPayments,
          vehicles: vehicles?.map(v => v.vehicle_number) || [],
          lastTransaction: transactions?.[0]?.created_at || null,
        });
      }

      setCustomers(customersWithDetails);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold uppercase tracking-wide">Customer Khata</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <NeoCard key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-secondary" />
            </NeoCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold uppercase tracking-wide">Customer Khata</h2>
        <NeoButton 
          variant="primary" 
          size="sm"
          onClick={() => navigate("/add")}
        >
          <Plus className="w-4 h-4" /> Add
        </NeoButton>
      </div>

      {customers.length === 0 ? (
        <NeoCard className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No customers yet</p>
          <NeoButton variant="primary" onClick={() => navigate("/add")}>
            Add First Customer
          </NeoButton>
        </NeoCard>
      ) : (
        customers.map((customer) => (
          <NeoCard key={customer.id} hoverable className="p-0 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {customer.lastTransaction 
                      ? new Date(customer.lastTransaction).toLocaleDateString("en-IN", { 
                          month: "short", 
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "No transactions"}
                  </p>
                </div>
                {getStatusBadge(customer.currentOutstanding, customer.credit_limit)}
              </div>

              {customer.vehicles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {customer.vehicles.slice(0, 3).map((vehicle) => (
                    <span
                      key={vehicle}
                      className="px-2 py-1 bg-secondary border-[2px] border-primary/40 font-mono text-xs font-bold text-primary"
                    >
                      {vehicle}
                    </span>
                  ))}
                  {customer.vehicles.length > 3 && (
                    <span className="px-2 py-1 bg-secondary border-[2px] border-primary/40 font-mono text-xs font-bold text-muted-foreground">
                      +{customer.vehicles.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-secondary border-[2px] border-primary/40 -mx-4 -mb-4 mt-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outstanding</p>
                  <p className="font-mono text-2xl font-bold text-foreground">
                    ₹{customer.currentOutstanding.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Limit: ₹{customer.credit_limit.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {customer.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp(customer.phone!, customer.name, customer.currentOutstanding);
                      }}
                      className="w-10 h-10 bg-success border-[2px] border-success flex items-center justify-center hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-5 h-5 text-success-foreground" strokeWidth={3} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customers/${customer.id}`);
                    }}
                    className="w-10 h-10 bg-primary border-[2px] border-primary flex items-center justify-center hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all"
                    title="View Details"
                  >
                    <ChevronRight className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </NeoCard>
        ))
      )}
    </div>
  );
}
