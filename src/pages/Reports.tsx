import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { NeoCard } from "@/components/ui/NeoCard";
import { BarChart3, TrendingUp, Calendar, Download } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";

export default function Reports() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="p-4 space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-wide">Reports & Analytics</h2>
        <p className="text-muted-foreground">Admin-only insights and data exports</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NeoCard hoverable className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary border-[2px] border-primary flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Monthly Summary</h3>
                <p className="text-sm text-muted-foreground">Credit & payment overview</p>
              </div>
            </div>
            <NeoButton variant="secondary" className="w-full">
              <Download className="w-4 h-4" /> Export Report
            </NeoButton>
          </NeoCard>

          <NeoCard hoverable className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-success border-[2px] border-success flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-foreground" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Collection Report</h3>
                <p className="text-sm text-muted-foreground">Payment collection trends</p>
              </div>
            </div>
            <NeoButton variant="secondary" className="w-full">
              <Download className="w-4 h-4" /> Export Report
            </NeoButton>
          </NeoCard>

          <NeoCard hoverable className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-warning border-[2px] border-warning flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-foreground" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Staff Activity</h3>
                <p className="text-sm text-muted-foreground">Entries by staff member</p>
              </div>
            </div>
            <NeoButton variant="secondary" className="w-full">
              <Download className="w-4 h-4" /> Export Report
            </NeoButton>
          </NeoCard>
        </div>

        <NeoCard className="p-5 mt-6">
          <p className="text-muted-foreground text-center">
            More detailed analytics coming soon...
          </p>
        </NeoCard>
      </main>
      
      <Navigation />
    </div>
  );
}
