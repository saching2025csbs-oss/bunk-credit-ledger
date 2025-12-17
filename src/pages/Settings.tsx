import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { User, Shield, Database, Bell, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const settingsItems = [
  { icon: User, title: "Profile", description: "Update your profile information" },
  { icon: Shield, title: "Security", description: "Change password settings" },
  { icon: Database, title: "Data Export", description: "Download transaction data" },
  { icon: Bell, title: "Notifications", description: "Alert preferences" },
  { icon: HelpCircle, title: "Help", description: "FAQs and support" },
];

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="p-4 space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-wide">Settings</h2>
        
        <div className="space-y-3">
          {settingsItems.map((item, index) => (
            <NeoCard 
              key={item.title} 
              hoverable 
              className="p-4 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary border-[2px] border-primary/40 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </NeoCard>
          ))}
        </div>

        <div className="pt-4">
          <NeoButton variant="destructive" className="w-full" onClick={handleLogout}>
            🚪 Logout
          </NeoButton>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground font-mono">BunkCredit v2.0.0</p>
          <p className="text-xs text-muted-foreground">Enterprise Credit Ledger</p>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}
