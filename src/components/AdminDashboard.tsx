import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreditTrendChart } from "./CreditTrendChart";
import { AdminRecentTransactions } from "./AdminRecentTransactions";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  totalOutstanding: number;
  recoveredThisMonth: number;
  activeCustomers: number;
  overLimitCount: number;
  todayCredit: number;
  todayPayments: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOutstanding: 0,
    recoveredThisMonth: 0,
    activeCustomers: 0,
    overLimitCount: 0,
    todayCredit: 0,
    todayPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get all customers
      const { data: customers } = await supabase
        .from("customers")
        .select("id, credit_limit");

      // Get all transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, customer_id, created_at");

      // Get all payments
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, customer_id, created_at");

      // Calculate stats
      const totalTransactions = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // This month's payments
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthPayments = payments?.filter(p => new Date(p.created_at) >= startOfMonth)
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Today's data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCredit = transactions?.filter(t => new Date(t.created_at) >= today)
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const todayPayments = payments?.filter(p => new Date(p.created_at) >= today)
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Over limit customers
      let overLimitCount = 0;
      customers?.forEach(customer => {
        const customerTxns = transactions?.filter(t => t.customer_id === customer.id)
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const customerPmts = payments?.filter(p => p.customer_id === customer.id)
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        if (customerTxns - customerPmts > Number(customer.credit_limit)) {
          overLimitCount++;
        }
      });

      setStats({
        totalOutstanding: totalTransactions - totalPayments,
        recoveredThisMonth: monthPayments,
        activeCustomers: customers?.length || 0,
        overLimitCount,
        todayCredit,
        todayPayments,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="admin-theme min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.full_name || "Admin"}!
          </h1>
          <p className="text-muted-foreground">
            Here's your business overview for today
          </p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="bento-grid mb-6">
          {/* Total Outstanding */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  ₹{stats.totalOutstanding.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-destructive/10 rounded-xl">
                <IndianRupee className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
              <span className="text-destructive font-medium">+₹{stats.todayCredit.toLocaleString()}</span>
              <span className="text-muted-foreground">today</span>
            </div>
          </div>

          {/* Recovered This Month */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recovered (Month)</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  ₹{stats.recoveredThisMonth.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-success/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs">
              <ArrowDownRight className="w-3.5 h-3.5 text-success" />
              <span className="text-success font-medium">+₹{stats.todayPayments.toLocaleString()}</span>
              <span className="text-muted-foreground">today</span>
            </div>
          </div>

          {/* Active Customers */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.activeCustomers}
                </p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              With active credit accounts
            </p>
          </div>

          {/* Over Limit Alert */}
          <div className={`admin-card p-5 ${stats.overLimitCount > 0 ? 'border-warning bg-warning/5' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Over Credit Limit</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.overLimitCount}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stats.overLimitCount > 0 ? 'bg-warning/20' : 'bg-muted'}`}>
                <AlertTriangle className={`w-5 h-5 ${stats.overLimitCount > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {stats.overLimitCount > 0 ? 'Action required' : 'All customers within limits'}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-6">
          <CreditTrendChart />
        </div>

        {/* Recent Activity */}
        <AdminRecentTransactions />
      </div>
    </div>
  );
}
