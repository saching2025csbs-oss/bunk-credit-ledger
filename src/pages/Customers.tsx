import { AdminHeader } from "@/components/AdminHeader";
import { AdminCustomerList } from "@/components/AdminCustomerList";
import { CustomerList } from "@/components/CustomerList";
import { StaffNavigation } from "@/components/StaffNavigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Customers() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return (
      <div className="admin-theme min-h-screen bg-background">
        <AdminHeader />
        <AdminCustomerList />
      </div>
    );
  }

  // Staff view with industrial theme
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary uppercase tracking-wider mb-4">
          CUSTOMER KHATA
        </h1>
        <CustomerList />
      </div>
      <StaffNavigation />
    </div>
  );
}
