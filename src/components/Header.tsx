import { Fuel, User, LogOut } from "lucide-react";
import { NeoBadge } from "./ui/NeoBadge";

interface HeaderProps {
  userName?: string;
  role?: "admin" | "staff";
}

export function Header({ userName = "Ramesh", role = "staff" }: HeaderProps) {
  return (
    <header className="bg-card border-b-[3px] border-foreground p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary border-[3px] border-foreground flex items-center justify-center shadow-neo-sm">
            <Fuel className="w-7 h-7" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">BunkCredit</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Digital Credit Ledger
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold">{userName}</span>
              <NeoBadge variant={role === "admin" ? "primary" : "default"}>
                {role}
              </NeoBadge>
            </div>
          </div>
          <button className="w-10 h-10 bg-secondary border-[2px] border-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <LogOut className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </header>
  );
}
