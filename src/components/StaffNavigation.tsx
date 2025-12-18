import { Home, PlusCircle, Users, BarChart3, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function StaffNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();

  const navItems = [
    { icon: Home, label: "HOME", path: "/" },
    { icon: PlusCircle, label: "ADD", path: "/add" },
    { icon: Users, label: "KHATA", path: "/customers" },
  ];

  if (isAdmin) {
    navItems.push({ icon: BarChart3, label: "REPORTS", path: "/reports" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-[3px] border-primary z-50">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-bold mt-1 tracking-wider">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={signOut}
          className="flex-1 flex flex-col items-center justify-center py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-6 h-6" strokeWidth={2} />
          <span className="text-[10px] font-bold mt-1 tracking-wider">EXIT</span>
        </button>
      </div>
    </nav>
  );
}
