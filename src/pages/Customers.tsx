import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { CustomerList } from "@/components/CustomerList";

export default function Customers() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="p-4">
        <CustomerList />
      </main>
      
      <Navigation />
    </div>
  );
}
