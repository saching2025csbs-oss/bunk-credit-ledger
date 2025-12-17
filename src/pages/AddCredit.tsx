import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { AddCreditForm } from "@/components/AddCreditForm";

export default function AddCredit() {
  return (
    <div className="min-h-screen bg-background">
      <Header userName="Ramesh" role="staff" />
      <AddCreditForm />
      <Navigation />
    </div>
  );
}
