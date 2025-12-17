import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, IndianRupee, FileText, MessageCircle, Plus, Trash2, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoSelect } from "@/components/ui/NeoSelect";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateBillPDF } from "@/utils/pdfGenerator";

interface CustomerDetails {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  credit_limit: number;
}

interface Transaction {
  id: string;
  vehicle_number: string;
  amount: number;
  fuel_type: string;
  created_at: string;
  staff_name: string;
  notes: string | null;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  created_at: string;
  staff_name: string;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, user, profile } = useAuth();
  const { toast } = useToast();

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentRef, setPaymentRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const fetchCustomerDetails = async () => {
    if (!id) return;

    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });

      setTransactions(transactionsData || []);

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });

      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = totalTransactions - totalPayments;

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("payments").insert({
        customer_id: id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        reference_number: paymentRef || null,
        created_by: user?.id,
        staff_name: profile?.full_name || "Unknown",
      });

      if (error) throw error;

      toast({
        title: "Payment Recorded",
        description: `₹${parseFloat(paymentAmount).toLocaleString()} payment received`,
      });

      setShowAddPayment(false);
      setPaymentAmount("");
      setPaymentMethod("cash");
      setPaymentRef("");
      fetchCustomerDetails();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleGenerateBill = () => {
    if (!customer) return;

    const filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.created_at);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      return txDate >= start && txDate <= end;
    });

    if (filteredTransactions.length === 0) {
      toast({
        title: "No Transactions",
        description: "No transactions found in the selected date range",
        variant: "destructive",
      });
      return;
    }

    generateBillPDF(customer, filteredTransactions, startDate, endDate);
    
    toast({
      title: "Bill Generated",
      description: "PDF has been downloaded",
    });
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", txId);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== txId));
      toast({ title: "Deleted", description: "Transaction deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleDeletePayment = async (payId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", payId);

      if (error) throw error;

      setPayments(payments.filter(p => p.id !== payId));
      toast({ title: "Deleted", description: "Payment deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 animate-pulse">
          <div className="h-32 bg-secondary mb-4" />
          <div className="h-64 bg-secondary" />
        </div>
        <Navigation />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Customer not found</p>
          <NeoButton onClick={() => navigate("/customers")} className="mt-4">
            Go Back
          </NeoButton>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="p-4 space-y-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/customers")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Customers
        </button>

        {/* Customer Info */}
        <NeoCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
              {customer.phone && (
                <p className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Phone className="w-4 h-4" /> {customer.phone}
                </p>
              )}
              {customer.address && (
                <p className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" /> {customer.address}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Outstanding</p>
              <p className={`font-mono text-3xl font-bold ${outstanding > 0 ? "text-destructive" : "text-success"}`}>
                ₹{outstanding.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Limit: ₹{customer.credit_limit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary border-[2px] border-primary/40">
              <p className="text-xs text-muted-foreground uppercase">Total Credit</p>
              <p className="font-mono text-xl font-bold text-warning">₹{totalTransactions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-secondary border-[2px] border-primary/40">
              <p className="text-xs text-muted-foreground uppercase">Total Paid</p>
              <p className="font-mono text-xl font-bold text-success">₹{totalPayments.toLocaleString()}</p>
            </div>
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <NeoButton 
            variant="success" 
            onClick={() => setShowAddPayment(true)}
            className="flex-1"
          >
            <Plus className="w-5 h-5" /> Record Payment
          </NeoButton>
          {customer.phone && (
            <NeoButton 
              variant="secondary"
              onClick={() => {
                const phone = customer.phone!.replace(/\D/g, "");
                const message = encodeURIComponent(
                  `Hello, your outstanding bill is ₹${outstanding.toLocaleString()}. Please pay via UPI. Thank you! - BunkCredit`
                );
                window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
              }}
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </NeoButton>
          )}
        </div>

        {/* Add Payment Modal */}
        {showAddPayment && (
          <NeoCard className="p-4 space-y-4 animate-slide-in">
            <h3 className="font-bold text-lg">Record Payment</h3>
            <NeoInput
              label="Amount (₹)"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
              className="font-mono"
            />
            <NeoSelect
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: "cash", label: "Cash" },
                { value: "upi", label: "UPI" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "cheque", label: "Cheque" },
              ]}
            />
            <NeoInput
              label="Reference (Optional)"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="Transaction ID / Cheque No."
            />
            <div className="flex gap-2">
              <NeoButton variant="success" onClick={handleAddPayment} className="flex-1">
                Save Payment
              </NeoButton>
              <NeoButton variant="ghost" onClick={() => setShowAddPayment(false)}>
                Cancel
              </NeoButton>
            </div>
          </NeoCard>
        )}

        {/* Generate Bill */}
        <NeoCard className="p-4">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Generate Bill
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <NeoInput
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <NeoInput
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <NeoButton variant="primary" onClick={handleGenerateBill} className="w-full">
            <FileText className="w-5 h-5" /> Download PDF Bill
          </NeoButton>
        </NeoCard>

        {/* Transaction History */}
        <div>
          <h3 className="font-bold text-lg mb-3 uppercase tracking-wide">Transaction History</h3>
          {transactions.length === 0 ? (
            <NeoCard className="p-4 text-center text-muted-foreground">
              No transactions yet
            </NeoCard>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <NeoCard key={tx.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-primary">{tx.vehicle_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-mono font-bold text-warning">+₹{Number(tx.amount).toLocaleString()}</p>
                        <NeoBadge variant="warning">{tx.fuel_type}</NeoBadge>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="w-8 h-8 bg-destructive/20 border border-destructive/40 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </NeoCard>
              ))}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div>
          <h3 className="font-bold text-lg mb-3 uppercase tracking-wide">Payment History</h3>
          {payments.length === 0 ? (
            <NeoCard className="p-4 text-center text-muted-foreground">
              No payments yet
            </NeoCard>
          ) : (
            <div className="space-y-2">
              {payments.map((pay) => (
                <NeoCard key={pay.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold capitalize">{pay.payment_method.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pay.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {pay.reference_number && ` • Ref: ${pay.reference_number}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-success">-₹{Number(pay.amount).toLocaleString()}</p>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeletePayment(pay.id)}
                          className="w-8 h-8 bg-destructive/20 border border-destructive/40 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </NeoCard>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}
