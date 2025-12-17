import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Customer {
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

export function generateBillPDF(
  customer: Customer,
  transactions: Transaction[],
  startDate: string,
  endDate: string
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(30, 41, 59); // Dark slate
  doc.rect(0, 0, 210, 45, "F");
  
  doc.setTextColor(251, 191, 36); // Gold
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("BunkCredit", 20, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Enterprise Credit Ledger", 20, 35);

  // Bill Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CREDIT STATEMENT", 105, 60, { align: "center" });

  // Date Range
  const dateRange = `${startDate ? new Date(startDate).toLocaleDateString("en-IN") : "Beginning"} to ${endDate ? new Date(endDate).toLocaleDateString("en-IN") : "Today"}`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${dateRange}`, 105, 68, { align: "center" });

  // Customer Info Box
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 75, 180, 35, "F");
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.5);
  doc.rect(15, 75, 180, 35, "S");

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 85);
  
  doc.setFontSize(14);
  doc.text(customer.name, 20, 93);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (customer.phone) {
    doc.text(`Phone: ${customer.phone}`, 20, 101);
  }
  if (customer.address) {
    doc.text(`Address: ${customer.address}`, 20, 108);
  }

  // Generated Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 140, 85);
  doc.text(`Credit Limit: ₹${customer.credit_limit.toLocaleString()}`, 140, 93);

  // Transactions Table
  const tableData = transactions.map((tx, index) => [
    (index + 1).toString(),
    new Date(tx.created_at).toLocaleDateString("en-IN"),
    tx.vehicle_number,
    tx.fuel_type.toUpperCase(),
    `₹${Number(tx.amount).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 120,
    head: [["#", "Date", "Vehicle No.", "Fuel", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [251, 191, 36],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "center", cellWidth: 35 },
      2: { halign: "center", cellWidth: 45, fontStyle: "bold" },
      3: { halign: "center", cellWidth: 30 },
      4: { halign: "right", cellWidth: 40, fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  
  doc.setFillColor(251, 191, 36);
  doc.rect(120, finalY + 5, 75, 15, "F");
  doc.setDrawColor(30, 41, 59);
  doc.rect(120, finalY + 5, 75, 15, "S");
  
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 125, finalY + 14);
  doc.text(`₹${total.toLocaleString()}`, 190, finalY + 14, { align: "right" });

  // Footer
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 280, 210, 17, "F");
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated statement. Please contact us for any discrepancies.", 105, 288, { align: "center" });
  doc.text("BunkCredit - Enterprise Credit Ledger System", 105, 293, { align: "center" });

  // Save the PDF
  const fileName = `BunkCredit_${customer.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
