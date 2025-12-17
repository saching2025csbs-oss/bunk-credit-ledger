import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { DashboardCards } from "@/components/DashboardCards";
import { RecentTransactions } from "@/components/RecentTransactions";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="p-4 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {greeting()}, <span className="text-gold-gradient">{profile?.full_name || "User"}</span>!
          </h2>
          <p className="text-muted-foreground font-medium">
            {isAdmin ? "Here's your bunk's credit overview" : "Ready to log transactions"}
          </p>
        </div>
        
        {isAdmin && <DashboardCards />}
        <RecentTransactions />
      </main>
      
      <Navigation />
    </div>
  );
}
