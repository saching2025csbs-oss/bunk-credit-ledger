import { Home, PlusCircle, Users, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/add", icon: PlusCircle, label: "Add Credit" },
  { path: "/customers", icon: Users, label: "Khata" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-[3px] border-foreground z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-3 px-4 font-bold text-xs uppercase tracking-wide transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
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
