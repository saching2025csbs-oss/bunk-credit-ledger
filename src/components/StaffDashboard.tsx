import { useState, useEffect } from "react";
import { Fuel, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface TodayStats {
  totalEntries: number;
  totalAmount: number;
}

interface RecentEntry {
  id: string;
  customer_name: string;
  vehicle_number: string;
  amount: number;
  fuel_type: string;
  created_at: string;
}

export function StaffDashboard() {
  const [stats, setStats] = useState<TodayStats>({ totalEntries: 0, totalAmount: 0 });
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayData();
  }, [user]);

  const fetchTodayData = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from("transactions")
        .select(`
          id, amount, vehicle_number, fuel_type, created_at,
          customers(name)
        `)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      const entries: RecentEntry[] = transactions?.map(t => ({
        id: t.id,
        customer_name: (t.customers as any)?.name || "Unknown",
        vehicle_number: t.vehicle_number,
        amount: Number(t.amount),
        fuel_type: t.fuel_type,
        created_at: t.created_at,
      })) || [];

      setRecentEntries(entries);
      setStats({
        totalEntries: entries.length,
        totalAmount: entries.reduce((sum, e) => sum + e.amount, 0),
      });
    } catch (error) {
      console.error("Error fetching today's data:", error);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-primary text-sm font-bold tracking-widest">{greeting()}</p>
        <h1 className="text-3xl font-bold text-foreground uppercase">
          {profile?.full_name || "Staff"}
        </h1>
      </div>

      {/* Big Action Button */}
      <button
        onClick={() => navigate("/add")}
        className="staff-button-primary w-full mb-6 text-2xl py-6"
      >
        <Fuel className="w-8 h-8" strokeWidth={3} />
        NEW CREDIT ENTRY
      </button>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="staff-card p-4">
          <p className="text-primary text-xs font-bold tracking-widest mb-1">TODAY'S ENTRIES</p>
          <p className="text-4xl font-bold font-mono text-foreground">{stats.totalEntries}</p>
        </div>
        <div className="staff-card p-4">
          <p className="text-primary text-xs font-bold tracking-widest mb-1">TODAY'S TOTAL</p>
          <p className="text-3xl font-bold font-mono text-foreground">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-5 h-5" strokeWidth={3} />
          RECENT ENTRIES
        </h2>
      </div>

      {recentEntries.length === 0 ? (
        <div className="staff-card p-6 text-center">
          <p className="text-muted-foreground font-bold">NO ENTRIES TODAY YET</p>
          <p className="text-sm text-muted-foreground mt-2">Tap the button above to add first entry</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="staff-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg text-foreground">{entry.customer_name}</p>
                  <p className="font-mono text-primary text-sm font-bold tracking-wider">
                    {entry.vehicle_number} • {entry.fuel_type.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-foreground">
                    ₹{entry.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-bold">
                    {format(new Date(entry.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
