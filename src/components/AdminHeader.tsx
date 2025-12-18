import { LogOut, User, Settings, LayoutDashboard, Users, FileText, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function AdminHeader() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BC</span>
            </div>
            <span className="font-bold text-foreground text-lg">BunkCredit</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/add")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Add Credit
            </button>
            <button
              onClick={() => navigate("/customers")}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Customers
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/reports")}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                Reports
              </button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {isAdmin ? "Admin" : "Staff"}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden flex border-t border-border overflow-x-auto">
        <button
          onClick={() => navigate("/")}
          className="flex-1 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-center whitespace-nowrap"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/add")}
          className="flex-1 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-center whitespace-nowrap"
        >
          Add Credit
        </button>
        <button
          onClick={() => navigate("/customers")}
          className="flex-1 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-center whitespace-nowrap"
        >
          Customers
        </button>
        {isAdmin && (
          <button
            onClick={() => navigate("/reports")}
            className="flex-1 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-center whitespace-nowrap"
          >
            Reports
          </button>
        )}
      </nav>
    </header>
  );
}
