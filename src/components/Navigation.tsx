import { Home, PlusCircle, Users, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/add", icon: PlusCircle, label: "Add Credit" },
    { path: "/customers", icon: Users, label: "Khata" },
    ...(isAdmin ? [{ path: "/reports", icon: BarChart3, label: "Reports" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-[3px] border-primary/40 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-3 px-4 font-bold text-xs uppercase tracking-wide transition-all flex-1",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" strokeWidth={3} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
