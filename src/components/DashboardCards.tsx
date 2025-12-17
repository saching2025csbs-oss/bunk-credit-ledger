import { IndianRupee, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { NeoCard } from "./ui/NeoCard";

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

  return (
    <NeoCard className={`${bgColors[variant]} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`font-bold uppercase tracking-wide text-sm ${textColors[variant]}`}>
          {title}
        </span>
        <div className={`w-10 h-10 border-[2px] border-foreground flex items-center justify-center ${variant === "default" ? "bg-primary" : "bg-card"}`}>
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Outstanding"
        value="₹1,20,500"
        icon={<IndianRupee className="w-5 h-5" strokeWidth={3} />}
        variant="destructive"
        subtitle="Across 12 customers"
      />
      <StatCard
        title="Recovered This Month"
        value="₹45,000"
        icon={<TrendingUp className="w-5 h-5" strokeWidth={3} />}
        variant="success"
        subtitle="+15% from last month"
      />
      <StatCard
        title="Pending Bills"
        value="8"
        icon={<Clock className="w-5 h-5" strokeWidth={3} />}
        variant="warning"
        subtitle="Due this week"
      />
      <StatCard
        title="Over Limit"
        value="3"
        icon={<AlertCircle className="w-5 h-5" strokeWidth={3} />}
        variant="default"
        subtitle="Customers exceeded limit"
      />
    </div>
  );
}
