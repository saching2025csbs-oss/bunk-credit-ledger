import { useState, useEffect } from "react";
import { IndianRupee, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { NeoCard } from "./ui/NeoCard";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  subtitle?: string;
}

function StatCard({ title, value, icon, variant = "default", subtitle }: StatCardProps) {
  const bgColors = {
    default: "bg-card",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  const textColors = {
    default: "text-foreground",
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    destructive: "text-destructive-foreground",
  };

  const borderColors = {
    default: "border-primary/40",
    success: "border-success",
    warning: "border-warning",
    destructive: "border-destructive",
  };

  return (
    <NeoCard className={`${bgColors[variant]} p-5 ${borderColors[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`font-bold uppercase tracking-wide text-xs ${textColors[variant]}`}>
          {title}
        </span>
        <div className={`w-10 h-10 border-[2px] ${borderColors[variant]} flex items-center justify-center ${variant === "default" ? "bg-primary text-primary-foreground" : "bg-card/20"}`}>
          {icon}
        </div>
      </div>
      <p className={`font-mono text-3xl md:text-4xl font-bold ${textColors[variant]}`}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-sm mt-1 font-medium ${variant === "default" ? "text-muted-foreground" : textColors[variant]} opacity-80`}>
          {subtitle}
        </p>
      )}
    </NeoCard>
  );
}

export function DashboardCards() {
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    recoveredThisMonth: 0,
    pendingCustomers: 0,
    overLimitCount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get all customers with their transactions and payments
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name, credit_limit");

      if (!customers) return;

      let totalOutstanding = 0;
      let overLimitCount = 0;

      for (const customer of customers) {
        // Get total transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("customer_id", customer.id);

        const totalTransactions = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        // Get total payments
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("customer_id", customer.id);

        const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const outstanding = totalTransactions - totalPayments;
        totalOutstanding += outstanding;

        if (outstanding > Number(customer.credit_limit)) {
          overLimitCount++;
        }
      }

      // Get payments this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthPayments } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", startOfMonth.toISOString());

      const recoveredThisMonth = monthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setStats({
        totalOutstanding: Math.max(0, totalOutstanding),
        recoveredThisMonth,
        pendingCustomers: customers.length,
        overLimitCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Outstanding"
        value={`₹${stats.totalOutstanding.toLocaleString()}`}
        icon={<IndianRupee className="w-5 h-5" strokeWidth={3} />}
        variant="destructive"
        subtitle={`Across ${stats.pendingCustomers} customers`}
      />
      <StatCard
        title="Recovered This Month"
        value={`₹${stats.recoveredThisMonth.toLocaleString()}`}
        icon={<TrendingUp className="w-5 h-5" strokeWidth={3} />}
        variant="success"
        subtitle="Payments received"
      />
      <StatCard
        title="Active Customers"
        value={stats.pendingCustomers.toString()}
        icon={<Clock className="w-5 h-5" strokeWidth={3} />}
        variant="warning"
        subtitle="With credit accounts"
      />
      <StatCard
        title="Over Limit"
        value={stats.overLimitCount.toString()}
        icon={<AlertCircle className="w-5 h-5" strokeWidth={3} />}
        variant="default"
        subtitle="Exceeded credit limit"
      />
    </div>
  );
}
