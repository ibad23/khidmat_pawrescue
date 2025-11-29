"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, RotateCcw, MoreVertical, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddDonationDialog } from "@/components/dialogs/AddDonationDialog";
import { AddRevenueDialog } from "@/components/dialogs/AddRevenueDialog";
import { AddTransactionDialog } from "@/components/dialogs/AddTransactionDialog";
import { useState } from "react";
import { toast } from "sonner";

const donationsData = [
  { id: "D-0001", donor: "Aslam", contact: "0321824910", amount: "1000 PKR", mode: "Cash", date: "14 Feb 2012" },
  { id: "D-0002", donor: "Sara Khan", contact: "0334567890", amount: "2000 PKR", mode: "Online", date: "20 Feb 2012" },
  { id: "D-0003", donor: "Ahmed Ali", contact: "0321111222", amount: "1500 PKR", mode: "Cash", date: "25 Feb 2012" },
  { id: "D-0004", donor: "Fatima", contact: "0345678901", amount: "3000 PKR", mode: "Bank Transfer", date: "1 Mar 2012" },
  { id: "D-0005", donor: "Hassan", contact: "0312345678", amount: "500 PKR", mode: "Cash", date: "5 Mar 2012" },
  { id: "D-0006", donor: "Ayesha", contact: "0323456789", amount: "2500 PKR", mode: "Online", date: "10 Mar 2012" },
];

const revenueData = [
  { id: "R-0001", name: "PA-001", contact: "03124589301", amount: "1000 PKR", mode: "Cash", remarks: "Bought a Collar", date: "14 Feb 2012" },
  { id: "R-0002", name: "PA-002", contact: "03345678902", amount: "1500 PKR", mode: "Online", remarks: "Cat Food Purchase", date: "18 Feb 2012" },
  { id: "R-0003", name: "PA-003", contact: "03212345678", amount: "800 PKR", mode: "Cash", remarks: "Leash and Toys", date: "22 Feb 2012" },
  { id: "R-0004", name: "PA-004", contact: "03456789012", amount: "2000 PKR", mode: "Bank Transfer", remarks: "Adoption Fee", date: "28 Feb 2012" },
  { id: "R-0005", name: "PA-005", contact: "03123456789", amount: "1200 PKR", mode: "Online", remarks: "Medical Supplies", date: "5 Mar 2012" },
];

const transactionData = [
  { id: "T-0001", billFor: "Chicken", amount: "1000 PKR", mode: "Cash", remarks: "Monthly supply", date: "14 Feb 2012" },
  { id: "T-0002", billFor: "Veterinary Supplies", amount: "3500 PKR", mode: "Bank Transfer", remarks: "Medical equipment", date: "16 Feb 2012" },
  { id: "T-0003", billFor: "Cat Food", amount: "2500 PKR", mode: "Cash", remarks: "Bulk purchase", date: "20 Feb 2012" },
  { id: "T-0004", billFor: "Electricity Bill", amount: "4000 PKR", mode: "Online", remarks: "Monthly utility", date: "25 Feb 2012" },
  { id: "T-0005", billFor: "Cleaning Supplies", amount: "1500 PKR", mode: "Cash", remarks: "Sanitation products", date: "1 Mar 2012" },
];

const FinancesPage = () => {
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  const [donations, setDonations] = useState(donationsData);
  const [revenue, setRevenue] = useState(revenueData);
  const [transactions, setTransactions] = useState(transactionData);

  const [donationFilters, setDonationFilters] = useState({ date: "", mode: "", donor: "" });
  const [revenueFilters, setRevenueFilters] = useState({ date: "", mode: "" });
  const [transactionFilters, setTransactionFilters] = useState({ date: "", mode: "" });

  const filteredDonations = donations.filter((d) => {
    if (donationFilters.mode && donationFilters.mode !== "all" && d.mode !== donationFilters.mode) return false;
    return true;
  });

  const filteredRevenue = revenue.filter((r) => {
    if (revenueFilters.mode && revenueFilters.mode !== "all" && r.mode !== revenueFilters.mode) return false;
    return true;
  });

  const filteredTransactions = transactions.filter((t) => {
    if (transactionFilters.mode && transactionFilters.mode !== "all" && t.mode !== transactionFilters.mode) return false;
    return true;
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Finances</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Donations</div>
            <div className="text-2xl font-bold text-foreground">40,689 PKR</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Tevenue</div>
            <div className="text-2xl font-bold text-foreground">10293 PKR</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Bills Paid</div>
            <div className="text-2xl font-bold text-foreground">89,000 PKR</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Remaining Balance</div>
            <div className="text-2xl font-bold text-foreground">89,00 PKR</div>
          </Card>
        </div>

        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full grid grid-cols-3">
            <TabsTrigger 
              value="donations" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Donations
            </TabsTrigger>
            <TabsTrigger 
              value="revenue" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Revenue
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-4">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Filter className="w-5 h-5" />
                  </Button>
                  
                  <Button variant="outline" className="gap-2">
                    Filter By
                  </Button>

                  <Select value={donationFilters.date} onValueChange={(v) => setDonationFilters({...donationFilters, date: v})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={donationFilters.mode} onValueChange={(v) => setDonationFilters({...donationFilters, mode: v})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="ghost" 
                    className="gap-2 text-primary hover:bg-[hsl(var(--hover-light-yellow))]"
                    onClick={() => setDonationFilters({ date: "", mode: "", donor: "" })}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Filter
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => exportToCSV(donations, "donations")}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setShowAddDonation(true)}
                  >
                    + Add Donation
                  </Button>
                </div>
              </div>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Donation ID</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Donor Name</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Contact Number</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Mode</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
                  </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation, index) => (
                    <tr key={index} className="border-b border-border hover:bg-card/50">
                      <td className="py-4 px-4 text-foreground">{donation.id}</td>
                      <td className="py-4 px-4 text-foreground">{donation.donor}</td>
                      <td className="py-4 px-4 text-foreground">{donation.contact}</td>
                      <td className="py-4 px-4 text-foreground">{donation.amount}</td>
                      <td className="py-4 px-4 text-foreground">{donation.mode}</td>
                      <td className="py-4 px-4 text-foreground">{donation.date}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Filter className="w-5 h-5" />
                  </Button>
                  
                  <Button variant="outline" className="gap-2">
                    Filter By
                  </Button>

                  <Select value={revenueFilters.date} onValueChange={(v) => setRevenueFilters({...revenueFilters, date: v})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={revenueFilters.mode} onValueChange={(v) => setRevenueFilters({...revenueFilters, mode: v})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="ghost" 
                    className="gap-2 text-primary hover:bg-[hsl(var(--hover-light-yellow))]"
                    onClick={() => setRevenueFilters({ date: "", mode: "" })}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Filter
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => exportToCSV(revenue, "revenue")}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setShowAddRevenue(true)}
                  >
                    + Add Revenue
                  </Button>
                </div>
              </div>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Revenue ID</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Contact Number</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Mode</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Remarks</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRevenue.map((rev, index) => (
                    <tr key={index} className="border-b border-border hover:bg-card/50">
                      <td className="py-4 px-4 text-foreground">{rev.id}</td>
                      <td className="py-4 px-4 text-foreground">{rev.name}</td>
                      <td className="py-4 px-4 text-foreground">{rev.contact}</td>
                      <td className="py-4 px-4 text-foreground">{rev.amount}</td>
                      <td className="py-4 px-4 text-foreground">{rev.mode}</td>
                      <td className="py-4 px-4 text-foreground">{rev.remarks}</td>
                      <td className="py-4 px-4 text-foreground">{rev.date}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Filter className="w-5 h-5" />
                  </Button>
                  
                  <Button variant="outline" className="gap-2">
                    Filter By
                  </Button>

                  <Select value={transactionFilters.date} onValueChange={(v) => setTransactionFilters({...transactionFilters, date: v})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={transactionFilters.mode} onValueChange={(v) => setTransactionFilters({...transactionFilters, mode: v})}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="ghost" 
                    className="gap-2 text-primary hover:bg-[hsl(var(--hover-light-yellow))]"
                    onClick={() => setTransactionFilters({ date: "", mode: "" })}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Filter
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => exportToCSV(transactions, "transactions")}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setShowAddTransaction(true)}
                  >
                    + Add Transaction
                  </Button>
                </div>
              </div>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Transaction ID</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Bill For</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Mode</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Remarks</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-border hover:bg-card/50">
                      <td className="py-4 px-4 text-foreground">{transaction.id}</td>
                      <td className="py-4 px-4 text-foreground">{transaction.billFor}</td>
                      <td className="py-4 px-4 text-foreground">{transaction.amount}</td>
                      <td className="py-4 px-4 text-foreground">{transaction.mode}</td>
                      <td className="py-4 px-4 text-foreground">{transaction.remarks}</td>
                      <td className="py-4 px-4 text-foreground">{transaction.date}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddDonationDialog 
        open={showAddDonation} 
        onOpenChange={setShowAddDonation}
        onAdd={(newDonation) => setDonations([newDonation, ...donations])}
      />
      <AddRevenueDialog 
        open={showAddRevenue} 
        onOpenChange={setShowAddRevenue}
        onAdd={(newRevenue) => setRevenue([newRevenue, ...revenue])}
      />
      <AddTransactionDialog 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction}
        onAdd={(newTransaction) => setTransactions([newTransaction, ...transactions])}
      />
    </DashboardLayout>
  );
};

export default FinancesPage;
