"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, RotateCcw, MoreVertical, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AddDonationDialog } from "@/components/dialogs/AddDonationDialog";
import { AddRevenueDialog } from "@/components/dialogs/AddRevenueDialog";
import { AddTransactionDialog } from "@/components/dialogs/AddTransactionDialog";
import { EditDonationDialog } from "@/components/dialogs/EditDonationDialog";
import { EditRevenueDialog } from "@/components/dialogs/EditRevenueDialog";
import { EditTransactionDialog } from "@/components/dialogs/EditTransactionDialog";
import { DeleteDonationDialog } from "@/components/dialogs/DeleteDonationDialog";
import { DeleteRevenueDialog } from "@/components/dialogs/DeleteRevenueDialog";
import { DeleteTransactionDialog } from "@/components/dialogs/DeleteTransactionDialog";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Donation, Revenue, Transaction } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

function mapDonation(d: any): Donation {
  return {
    donation_id: d.donation_id,
    donor_id: d.donor_id,
    mode: d.mode,
    amount: d.amount,
    date: d.date,
    donor_name: d.externals?.name || "",
    contact_num: d.externals?.contact_num || "",
  };
}

function mapRevenue(r: any): Revenue {
  return {
    revenue_id: r.revenue_id,
    buyer_id: r.buyer_id,
    mode: r.mode,
    amount: r.amount,
    date: r.date,
    remarks: r.remarks || "",
    buyer_name: r.externals?.name || "",
    contact_num: r.externals?.contact_num || "",
  };
}

function isInDateRange(dateStr: string, range: string): boolean {
  if (!range) return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (range === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (range === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo && d <= now;
  }
  if (range === "month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
}

const FinancesPage = () => {
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [editRevenue, setEditRevenue] = useState<Revenue | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const [deleteDonation, setDeleteDonation] = useState<Donation | null>(null);
  const [deleteRevenue, setDeleteRevenue] = useState<Revenue | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const [donationFilters, setDonationFilters] = useState({ date: "", mode: "" });
  const [revenueFilters, setRevenueFilters] = useState({ date: "", mode: "" });
  const [transactionFilters, setTransactionFilters] = useState({ date: "", mode: "" });

  const loadDonations = useCallback(async () => {
    setLoadingDonations(true);
    try {
      const res = await axios.get("/api/donations/read");
      setDonations((res.data.data || []).map(mapDonation));
    } catch { toast.error("Failed to load donations"); } finally { setLoadingDonations(false); }
  }, []);

  const loadRevenue = useCallback(async () => {
    setLoadingRevenue(true);
    try {
      const res = await axios.get("/api/revenue/read");
      setRevenue((res.data.data || []).map(mapRevenue));
    } catch { toast.error("Failed to load revenue"); } finally { setLoadingRevenue(false); }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const res = await axios.get("/api/transactions/read");
      setTransactions(res.data.data || []);
    } catch { toast.error("Failed to load transactions"); } finally { setLoadingTransactions(false); }
  }, []);

  useEffect(() => { loadDonations(); loadRevenue(); loadTransactions(); }, [loadDonations, loadRevenue, loadTransactions]);

  const filteredDonations = donations.filter((d) => {
    if (donationFilters.mode && donationFilters.mode !== "all" && d.mode !== donationFilters.mode) return false;
    if (!isInDateRange(d.date, donationFilters.date)) return false;
    return true;
  });

  const filteredRevenue = revenue.filter((r) => {
    if (revenueFilters.mode && revenueFilters.mode !== "all" && r.mode !== revenueFilters.mode) return false;
    if (!isInDateRange(r.date, revenueFilters.date)) return false;
    return true;
  });

  const filteredTransactions = transactions.filter((t) => {
    if (transactionFilters.mode && transactionFilters.mode !== "all" && t.mode !== transactionFilters.mode) return false;
    if (!isInDateRange(t.date, transactionFilters.date)) return false;
    return true;
  });

  // Pagination for each table
  const donationsPagination = usePagination(filteredDonations, {
    itemsPerPage: 15,
    resetDeps: [donationFilters.date, donationFilters.mode],
  });

  const revenuePagination = usePagination(filteredRevenue, {
    itemsPerPage: 15,
    resetDeps: [revenueFilters.date, revenueFilters.mode],
  });

  const transactionsPagination = usePagination(filteredTransactions, {
    itemsPerPage: 15,
    resetDeps: [transactionFilters.date, transactionFilters.mode],
  });

  const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalTransactions = transactions.reduce((s, t) => s + t.amount, 0);
  const balance = totalDonations + totalRevenue - totalTransactions;

  const handleDeleteDonation = async () => {
    if (!deleteDonation) return;
    try {
      await axios.delete("/api/donations/delete", { data: { donation_id: deleteDonation.donation_id } });
      loadDonations();
    } catch { toast.error("Failed to delete donation"); }
  };

  const handleDeleteRevenue = async () => {
    if (!deleteRevenue) return;
    try {
      await axios.delete("/api/revenue/delete", { data: { revenue_id: deleteRevenue.revenue_id } });
      loadRevenue();
    } catch { toast.error("Failed to delete revenue"); }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransaction) return;
    try {
      await axios.delete("/api/transactions/delete", { data: { transaction_id: deleteTransaction.transaction_id } });
      loadTransactions();
    } catch { toast.error("Failed to delete transaction"); }
  };

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

  const formatAmount = (n: number) => n.toLocaleString() + " PKR";
  const formatContact = (c: string) => {
    const digits = c.replace(/\D/g, "");
    return digits.length > 4 ? digits.slice(0, 4) + "-" + digits.slice(4) : digits;
  };

  const SkeletonRows = ({ cols }: { cols: number }) => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-border">
          {[...Array(cols)].map((_, j) => (
            <td key={j} className="py-4 px-4"><Skeleton className="h-4 w-full" /></td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Finances</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Donations</div>
            <div className="text-2xl font-bold text-foreground">{loadingDonations ? <Skeleton className="h-8 w-32" /> : formatAmount(totalDonations)}</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-foreground">{loadingRevenue ? <Skeleton className="h-8 w-32" /> : formatAmount(totalRevenue)}</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Bills Paid</div>
            <div className="text-2xl font-bold text-foreground">{loadingTransactions ? <Skeleton className="h-8 w-32" /> : formatAmount(totalTransactions)}</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-2">Remaining Balance</div>
            <div className="text-2xl font-bold text-foreground">{(loadingDonations || loadingRevenue || loadingTransactions) ? <Skeleton className="h-8 w-32" /> : formatAmount(balance)}</div>
          </Card>
        </div>

        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full grid grid-cols-3">
            <TabsTrigger value="donations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Donations</TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Revenue</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Transactions</TabsTrigger>
          </TabsList>

          {/* DONATIONS TAB */}
          <TabsContent value="donations" className="space-y-4">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Filter className="w-5 h-5" /></Button>
                  <Button variant="outline" className="gap-2">Filter By</Button>
                  <Select value={donationFilters.date} onValueChange={(v) => setDonationFilters({...donationFilters, date: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={donationFilters.mode} onValueChange={(v) => setDonationFilters({...donationFilters, mode: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setDonationFilters({ date: "", mode: "" })}>
                    <RotateCcw className="w-4 h-4" />Reset Filter
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => exportToCSV(filteredDonations, "donations")}>
                    <Download className="w-4 h-4" />Export CSV
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddDonation(true)}>+ Add Donation</Button>
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
                  {loadingDonations ? <SkeletonRows cols={7} /> : donationsPagination.paginatedItems.map((d) => (
                    <tr key={d.donation_id} className="border-b border-border hover:bg-card/50">
                      <td className="py-4 px-4 text-foreground">D-{String(d.donation_id).padStart(4, "0")}</td>
                      <td className="py-4 px-4 text-foreground">{d.donor_name}</td>
                      <td className="py-4 px-4 text-foreground">{formatContact(d.contact_num)}</td>
                      <td className="py-4 px-4 text-foreground">{formatAmount(d.amount)}</td>
                      <td className="py-4 px-4 text-foreground">{d.mode}</td>
                      <td className="py-4 px-4 text-foreground">{formatDate(d.date)}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditDonation(d)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDonation(d)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingDonations && donationsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {donationsPagination.startIndex} to {donationsPagination.endIndex} of {filteredDonations.length} donations
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => donationsPagination.goToPage(donationsPagination.currentPage - 1)} disabled={donationsPagination.currentPage === 1} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {donationsPagination.getPageNumbers().map((page, index) => (
                    typeof page === "number" ? (
                      <Button key={index} variant={donationsPagination.currentPage === page ? "default" : "outline"} size="sm" onClick={() => donationsPagination.goToPage(page)} className={`h-8 w-8 ${donationsPagination.currentPage === page ? "bg-primary text-primary-foreground" : ""}`}>
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2 text-muted-foreground">...</span>
                    )
                  ))}
                  <Button variant="outline" size="icon" onClick={() => donationsPagination.goToPage(donationsPagination.currentPage + 1)} disabled={donationsPagination.currentPage === donationsPagination.totalPages} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* REVENUE TAB */}
          <TabsContent value="revenue" className="space-y-4">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Filter className="w-5 h-5" /></Button>
                  <Button variant="outline" className="gap-2">Filter By</Button>
                  <Select value={revenueFilters.date} onValueChange={(v) => setRevenueFilters({...revenueFilters, date: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={revenueFilters.mode} onValueChange={(v) => setRevenueFilters({...revenueFilters, mode: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setRevenueFilters({ date: "", mode: "" })}>
                    <RotateCcw className="w-4 h-4" />Reset Filter
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => exportToCSV(filteredRevenue, "revenue")}>
                    <Download className="w-4 h-4" />Export CSV
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddRevenue(true)}>+ Add Revenue</Button>
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
                  {loadingRevenue ? <SkeletonRows cols={8} /> : revenuePagination.paginatedItems.map((r) => (
                    <tr key={r.revenue_id} className="border-b border-border hover:bg-card/50">
                      <td className="py-4 px-4 text-foreground">R-{String(r.revenue_id).padStart(4, "0")}</td>
                      <td className="py-4 px-4 text-foreground">{r.buyer_name}</td>
                      <td className="py-4 px-4 text-foreground">{formatContact(r.contact_num)}</td>
                      <td className="py-4 px-4 text-foreground">{formatAmount(r.amount)}</td>
                      <td className="py-4 px-4 text-foreground">{r.mode}</td>
                      <td className="py-4 px-4 text-foreground">{r.remarks}</td>
                      <td className="py-4 px-4 text-foreground">{formatDate(r.date)}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditRevenue(r)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteRevenue(r)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingRevenue && revenuePagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {revenuePagination.startIndex} to {revenuePagination.endIndex} of {filteredRevenue.length} revenue entries
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => revenuePagination.goToPage(revenuePagination.currentPage - 1)} disabled={revenuePagination.currentPage === 1} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {revenuePagination.getPageNumbers().map((page, index) => (
                    typeof page === "number" ? (
                      <Button key={index} variant={revenuePagination.currentPage === page ? "default" : "outline"} size="sm" onClick={() => revenuePagination.goToPage(page)} className={`h-8 w-8 ${revenuePagination.currentPage === page ? "bg-primary text-primary-foreground" : ""}`}>
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2 text-muted-foreground">...</span>
                    )
                  ))}
                  <Button variant="outline" size="icon" onClick={() => revenuePagination.goToPage(revenuePagination.currentPage + 1)} disabled={revenuePagination.currentPage === revenuePagination.totalPages} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TRANSACTIONS TAB */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Filter className="w-5 h-5" /></Button>
                  <Button variant="outline" className="gap-2">Filter By</Button>
                  <Select value={transactionFilters.date} onValueChange={(v) => setTransactionFilters({...transactionFilters, date: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={transactionFilters.mode} onValueChange={(v) => setTransactionFilters({...transactionFilters, mode: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setTransactionFilters({ date: "", mode: "" })}>
                    <RotateCcw className="w-4 h-4" />Reset Filter
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => exportToCSV(filteredTransactions, "transactions")}>
                    <Download className="w-4 h-4" />Export CSV
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddTransaction(true)}>+ Add Transaction</Button>
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
                  {loadingTransactions ? <SkeletonRows cols={7} /> : transactionsPagination.paginatedItems.map((t) => (
                    <tr key={t.transaction_id} className="border-b border-border hover:bg-card/50">
                      <td className="py-4 px-4 text-foreground">T-{String(t.transaction_id).padStart(4, "0")}</td>
                      <td className="py-4 px-4 text-foreground">{t.bill_for}</td>
                      <td className="py-4 px-4 text-foreground">{formatAmount(t.amount)}</td>
                      <td className="py-4 px-4 text-foreground">{t.mode}</td>
                      <td className="py-4 px-4 text-foreground">{t.remarks}</td>
                      <td className="py-4 px-4 text-foreground">{formatDate(t.date)}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditTransaction(t)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTransaction(t)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingTransactions && transactionsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {transactionsPagination.startIndex} to {transactionsPagination.endIndex} of {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => transactionsPagination.goToPage(transactionsPagination.currentPage - 1)} disabled={transactionsPagination.currentPage === 1} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {transactionsPagination.getPageNumbers().map((page, index) => (
                    typeof page === "number" ? (
                      <Button key={index} variant={transactionsPagination.currentPage === page ? "default" : "outline"} size="sm" onClick={() => transactionsPagination.goToPage(page)} className={`h-8 w-8 ${transactionsPagination.currentPage === page ? "bg-primary text-primary-foreground" : ""}`}>
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2 text-muted-foreground">...</span>
                    )
                  ))}
                  <Button variant="outline" size="icon" onClick={() => transactionsPagination.goToPage(transactionsPagination.currentPage + 1)} disabled={transactionsPagination.currentPage === transactionsPagination.totalPages} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dialogs */}
      <AddDonationDialog open={showAddDonation} onOpenChange={setShowAddDonation} onAdd={loadDonations} />
      <AddRevenueDialog open={showAddRevenue} onOpenChange={setShowAddRevenue} onAdd={loadRevenue} />
      <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} onAdd={loadTransactions} />

      {/* Edit Dialogs */}
      <EditDonationDialog open={!!editDonation} onOpenChange={(o) => !o && setEditDonation(null)} donation={editDonation} onEdit={loadDonations} />
      <EditRevenueDialog open={!!editRevenue} onOpenChange={(o) => !o && setEditRevenue(null)} revenue={editRevenue} onEdit={loadRevenue} />
      <EditTransactionDialog open={!!editTransaction} onOpenChange={(o) => !o && setEditTransaction(null)} transaction={editTransaction} onEdit={loadTransactions} />

      {/* Delete Dialogs */}
      <DeleteDonationDialog open={!!deleteDonation} onOpenChange={(o) => !o && setDeleteDonation(null)} onConfirm={handleDeleteDonation} />
      <DeleteRevenueDialog open={!!deleteRevenue} onOpenChange={(o) => !o && setDeleteRevenue(null)} onConfirm={handleDeleteRevenue} />
      <DeleteTransactionDialog open={!!deleteTransaction} onOpenChange={(o) => !o && setDeleteTransaction(null)} onConfirm={handleDeleteTransaction} />
    </DashboardLayout>
  );
};

export default FinancesPage;
