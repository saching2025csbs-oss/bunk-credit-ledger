import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  MessageCircle, 
  ChevronRight, 
  MoreHorizontal,
  Car,
  AlertTriangle,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  credit_limit: number;
  currentOutstanding: number;
  vehicles: string[];
  lastTransaction: string | null;
}

function openWhatsApp(phone: string, name: string, amount: number) {
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hello, your outstanding bill for December is ₹${amount.toLocaleString()}. Please pay via UPI. Thank you! - BunkCredit`
  );
  window.open(`https://wa.me/91${cleanPhone}?text=${message}`, "_blank");
}

export function AdminCustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
        const { data: vehicles } = await supabase
          .from("vehicle_numbers")
          .select("vehicle_number")
          .eq("customer_id", customer.id);

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, created_at")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

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

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vehicles.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (outstanding: number, limit: number) => {
    const percentage = (outstanding / limit) * 100;
    if (percentage >= 100) {
      return <span className="admin-badge-destructive">Over Limit</span>;
    } else if (percentage >= 80) {
      return <span className="admin-badge-warning">Near Limit</span>;
    }
    return <span className="admin-badge-success">Good</span>;
  };

  if (isLoading) {
    return (
      <div className="admin-theme min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="admin-card p-8 text-center text-muted-foreground">
            Loading customers...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Manage customer accounts & credit</p>
          </div>
          <button 
            onClick={() => navigate("/add")}
            className="admin-button-primary"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or vehicle number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
        </div>

        {/* Customer Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="admin-card p-8 text-center">
            <p className="text-muted-foreground mb-4">No customers found</p>
            <button onClick={() => navigate("/add")} className="admin-button-primary">
              Add First Customer
            </button>
          </div>
        ) : (
          <div className="bento-grid">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="admin-card-hover p-5"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.lastTransaction
                        ? `Last: ${new Date(customer.lastTransaction).toLocaleDateString("en-IN")}`
                        : "No transactions"}
                    </p>
                  </div>
                  {getStatusBadge(customer.currentOutstanding, customer.credit_limit)}
                </div>

                {/* Vehicles */}
                {customer.vehicles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {customer.vehicles.slice(0, 3).map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-muted rounded-md font-mono text-xs text-muted-foreground"
                      >
                        {v}
                      </span>
                    ))}
                    {customer.vehicles.length > 3 && (
                      <span className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground">
                        +{customer.vehicles.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Outstanding */}
                <div className="flex items-end justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="font-mono text-xl font-bold text-foreground">
                      ₹{customer.currentOutstanding.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of ₹{customer.credit_limit.toLocaleString()} limit
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {customer.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(customer.phone!, customer.name, customer.currentOutstanding);
                        }}
                        className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                        title="Send WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${customer.id}`);
                      }}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
