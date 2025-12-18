import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface ChartData {
  date: string;
  credit: number;
  payments: number;
}

type TimeRange = "7days" | "30days";

export function CreditTrendChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === "7days" ? 7 : 30;
      const startDate = startOfDay(subDays(new Date(), days - 1));

      // Fetch transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString());

      // Fetch payments
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString());

      // Group by date
      const groupedData: Record<string, ChartData> = {};

      // Initialize all dates
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - 1 - i), "MMM dd");
        groupedData[date] = { date, credit: 0, payments: 0 };
      }

      // Sum transactions
      transactions?.forEach((t) => {
        const date = format(new Date(t.created_at), "MMM dd");
        if (groupedData[date]) {
          groupedData[date].credit += Number(t.amount);
        }
      });

      // Sum payments
      payments?.forEach((p) => {
        const date = format(new Date(p.created_at), "MMM dd");
        if (groupedData[date]) {
          groupedData[date].payments += Number(p.amount);
        }
      });

      setData(Object.values(groupedData));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="admin-card p-3">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <p className="text-sm text-destructive">
            Credit: ₹{payload[0]?.value?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-success">
            Recovered: ₹{payload[1]?.value?.toLocaleString() || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="admin-card p-6">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading chart data...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Credit Trends</h3>
          <p className="text-sm text-muted-foreground">
            Daily credit vs recovery
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("7days")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === "7days"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30days")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === "30days"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="paymentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="credit"
              stroke="hsl(0, 84%, 60%)"
              fill="url(#creditGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="payments"
              stroke="hsl(142, 76%, 36%)"
              fill="url(#paymentGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Credit Given</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Payments Received</span>
        </div>
      </div>
    </div>
  );
}
