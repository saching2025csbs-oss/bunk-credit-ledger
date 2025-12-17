import { Fuel, LogOut, Shield, User as UserIcon } from "lucide-react";
import { NeoBadge } from "./ui/NeoBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { profile, role, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="bg-card border-b-[3px] border-primary/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary border-[3px] border-primary flex items-center justify-center shadow-neo-sm">
            <Fuel className="w-7 h-7 text-primary-foreground" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gold-gradient">BunkCredit</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Enterprise Ledger
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold text-foreground">{profile?.full_name || "User"}</span>
              {isAdmin ? (
                <span className="neo-badge-admin flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              ) : (
                <span className="neo-badge-staff flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  Staff
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-10 h-10 bg-secondary border-[2px] border-primary/40 flex items-center justify-center hover:bg-destructive hover:border-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </header>
  );
}
