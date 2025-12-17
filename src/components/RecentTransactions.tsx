import { useState, useEffect } from "react";
import { Fuel, Droplet, Car, Trash2 } from "lucide-react";
import { NeoCard } from "./ui/NeoCard";
import { NeoBadge } from "./ui/NeoBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  vehicle_number: string;
  customer_name: string;
  amount: number;
  fuel_type: "petrol" | "diesel" | "oil";
  created_at: string;
  staff_name: string;
}

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

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return `Today, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  
  return date.toLocaleDateString("en-IN", { 
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          vehicle_number,
          amount,
          fuel_type,
          created_at,
          staff_name,
          customers(name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedTransactions: Transaction[] = (data || []).map((t: any) => ({
        id: t.id,
        vehicle_number: t.vehicle_number,
        customer_name: t.customers?.name || "Unknown",
        amount: Number(t.amount),
        fuel_type: t.fuel_type,
        created_at: t.created_at,
        staff_name: t.staff_name || "Unknown",
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
      toast({
        title: "Deleted",
        description: "Transaction has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-wide">Recent Transactions</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <NeoCard key={i} className="p-3 animate-pulse">
              <div className="h-16 bg-secondary" />
            </NeoCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold uppercase tracking-wide">
        {isAdmin ? "Recent Transactions" : "Today's Transactions"}
      </h2>
      
      {transactions.length === 0 ? (
        <NeoCard className="p-6 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </NeoCard>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <NeoCard 
              key={transaction.id} 
              className="p-3 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary border-[2px] border-primary/40 flex items-center justify-center">
                    {getFuelIcon(transaction.fuel_type)}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-lg tracking-wider text-primary">
                      {transaction.vehicle_number}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {transaction.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(transaction.created_at)} • by {transaction.staff_name}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-mono text-xl font-bold">
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                    <NeoBadge variant={getFuelBadgeVariant(transaction.fuel_type)}>
                      {transaction.fuel_type}
                    </NeoBadge>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="w-10 h-10 bg-destructive/20 border-[2px] border-destructive/40 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            </NeoCard>
          ))}
        </div>
      )}
    </div>
  );
}
