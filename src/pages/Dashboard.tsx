import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { DashboardCards } from "@/components/DashboardCards";
import { RecentTransactions } from "@/components/RecentTransactions";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName="Owner" role="admin" />
      
      <main className="p-4 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Good Morning! ☀️</h2>
          <p className="text-muted-foreground font-medium">Here's your bunk's credit summary</p>
        </div>
        
        <DashboardCards />
        <RecentTransactions />
      </main>
      
      <Navigation />
    </div>
  );
}
