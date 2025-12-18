import { useState, useEffect } from "react";
import { Trash2, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "credit" | "payment";
  customer_name: string;
  amount: number;
  vehicle_number?: string;
  fuel_type?: string;
  payment_method?: string;
  staff_name: string;
  created_at: string;
}

export function AdminRecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Fetch recent transactions
      const { data: txns } = await supabase
        .from("transactions")
        .select(`
          id, amount, vehicle_number, fuel_type, staff_name, created_at,
          customers(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch recent payments
      const { data: pmts } = await supabase
        .from("payments")
        .select(`
          id, amount, payment_method, staff_name, created_at,
          customers(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      const combined: Transaction[] = [
        ...(txns?.map(t => ({
          id: t.id,
          type: "credit" as const,
          customer_name: (t.customers as any)?.name || "Unknown",
          amount: Number(t.amount),
          vehicle_number: t.vehicle_number,
          fuel_type: t.fuel_type,
          staff_name: t.staff_name || "Unknown",
          created_at: t.created_at,
        })) || []),
        ...(pmts?.map(p => ({
          id: p.id,
          type: "payment" as const,
          customer_name: (p.customers as any)?.name || "Unknown",
          amount: Number(p.amount),
          payment_method: p.payment_method || "Cash",
          staff_name: p.staff_name || "Unknown",
          created_at: p.created_at,
        })) || []),
      ];

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(combined.slice(0, 15));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "credit" | "payment") => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const table = type === "credit" ? "transactions" : "payments";
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Deleted",
        description: "Entry has been removed.",
      });
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="admin-card p-6">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest credit & payment entries</p>
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Customer</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Staff</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No recent transactions
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>
                    {txn.type === "credit" ? (
                      <span className="admin-badge-destructive flex items-center gap-1 w-fit">
                        <ArrowUpRight className="w-3 h-3" />
                        Credit
                      </span>
                    ) : (
                      <span className="admin-badge-success flex items-center gap-1 w-fit">
                        <ArrowDownRight className="w-3 h-3" />
                        Payment
                      </span>
                    )}
                  </td>
                  <td className="font-medium text-foreground">{txn.customer_name}</td>
                  <td className="text-muted-foreground">
                    {txn.type === "credit" ? (
                      <span className="font-mono text-xs">
                        {txn.vehicle_number} • {txn.fuel_type}
                      </span>
                    ) : (
                      <span className="text-xs">{txn.payment_method}</span>
                    )}
                  </td>
                  <td className={`font-mono font-semibold ${txn.type === "credit" ? "text-destructive" : "text-success"}`}>
                    {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                  </td>
                  <td className="text-sm text-muted-foreground">{txn.staff_name}</td>
                  <td className="text-sm text-muted-foreground">
                    {format(new Date(txn.created_at), "MMM dd, HH:mm")}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(txn.id, txn.type)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
