import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminDashboard } from "@/components/AdminDashboard";
import { StaffDashboard } from "@/components/StaffDashboard";
import { StaffNavigation } from "@/components/StaffNavigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { isAdmin } = useAuth();

  // Admin gets the clean SaaS Bento layout
  if (isAdmin) {
    return (
      <div className="admin-theme min-h-screen bg-background">
        <AdminHeader />
        <AdminDashboard />
      </div>
    );
  }

  // Staff gets the Industrial High-Vis mobile layout
  return (
    <div className="min-h-screen bg-background pb-20">
      <StaffDashboard />
      <StaffNavigation />
    </div>
  );
}
