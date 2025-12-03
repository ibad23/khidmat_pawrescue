"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, MoreVertical } from "lucide-react";
import { AddCatDialog } from "@/components/dialogs/AddCatDialog";
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
import { useRouter } from "next/navigation";

const statusColors = {
  success: "bg-status-success/20 text-status-success",
  danger: "bg-status-danger/20 text-status-danger",
  info: "bg-status-info/20 text-status-info",
  warning: "bg-status-warning/20 text-status-warning",
  purple: "bg-status-purple/20 text-status-purple",
};

function mapStatusToColor(status?: string) {
  if (!status) return "purple";
  const s = status.toLowerCase();
  if (s.includes("expired")) return "danger";
  if (s.includes("under treatment") || s.includes("under treatment")) return "info";
  if (s.includes("move") || s.includes("healthy")) return "success";
  if (s.includes("adopt")) return "warning";
  if (s.includes("discharge") || s.includes("foster")) return "purple";
  return "purple";
}

export default function CatsPage() {
  const router = useRouter();
  const [cats, setCats] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/cats/read");
        const rows = res.data?.data || [];
        const mapped = rows.map((r: any) => ({
          id: `PA-${String(r.cat_id).padStart(4, "0")}`,
          name: r.cat_name || "",
          owner: r.externals?.name || "",
          contact: r.externals?.contact_num || "",
          date: r.admitted_on ? new Date(r.admitted_on).toLocaleDateString() : "",
          admitted_on_raw: r.admitted_on || null,
          type: r.type || "",
          cage: r.cage?.cage_no ? `GW-C${r.cage.cage_no}` : "-",
          status: r.status || "",
          color: mapStatusToColor(r.status),
        }));
        setCats(mapped);
      } catch (err) {
        console.error("Failed to load cats", err);
      }
    };
    load();
  }, []);

  const handleAddCat = (newCat: any) => {
    setCats([...cats, newCat]);
  };

  const handleEditCat = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    setSelectedCat(cat);
    setShowEditDialog(true);
  };

  const handleDeleteCat = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    setSelectedCat(cat);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setCats(cats.filter((c) => c.id !== selectedCat.id));
    setSelectedCat(null);
  };

  const statusOptions = useMemo(() => {
    const s = new Set<string>();
    cats.forEach((c) => { if (c.status) s.add(c.status); });
    return Array.from(s);
  }, [cats]);

  const ownerOptions = useMemo(() => {
    const s = new Set<string>();
    cats.forEach((c) => { if (c.owner) s.add(c.owner); });
    return Array.from(s);
  }, [cats]);

  const filteredCats = cats.filter((cat) => {
    // Status filter
    if (statusFilter && statusFilter !== "all" && cat.status !== statusFilter) return false;

    // Owner filter
    if (ownerFilter && ownerFilter !== "all" && cat.owner !== ownerFilter) return false;

    // Date filter: compare admitted_on_raw
    if (dateFilter) {
      const raw = cat.admitted_on_raw;
      if (!raw) return false;
      const admitted = new Date(raw);
      const now = new Date();

      if (dateFilter === "today") {
        if (!(now.getFullYear() === admitted.getFullYear() && now.getMonth() === admitted.getMonth() && now.getDate() === admitted.getDate())) return false;
      } else if (dateFilter === "week") {
        const diffDays = (now.getTime() - admitted.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      } else if (dateFilter === "month") {
        const diffDays = (now.getTime() - admitted.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
      }
    }

    return true;
  });

  const handleResetFilter = () => {
    setDateFilter("");
    setStatusFilter("");
    setOwnerFilter("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Cats</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add New Cat
          </Button>
        </div>

        <Card className="bg-card border-border p-4">
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

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Owner / Reporter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {ownerOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              className="gap-2 text-primary hover:bg-[hsl(var(--hover-light-yellow))]"
              onClick={handleResetFilter}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filter
            </Button>
          </div>
        </Card>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat Name</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Owner / Reporter</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Contact No.</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Type</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cage No.</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCats.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-border hover:bg-card/50 cursor-pointer"
                  onClick={() => router.push(`/cats/${cat.id}`)}
                >
                  <td className="py-4 px-4 text-foreground">{cat.id}</td>
                  <td className="py-4 px-4 text-foreground">{cat.name}</td>
                  <td className="py-4 px-4 text-foreground">{cat.owner}</td>
                  <td className="py-4 px-4 text-foreground">{cat.contact}</td>
                  <td className="py-4 px-4 text-foreground">{cat.date}</td>
                  <td className="py-4 px-4 text-foreground">{cat.type}</td>
                  <td className="py-4 px-4 text-foreground">{cat.cage}</td>
                  <td className="py-4 px-4">
                    <Badge className={(statusColors as any)[cat.color]}>{cat.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: any) => e.stopPropagation()}>
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
      </div>

      <AddCatDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddCat} />
    </DashboardLayout>
  );
}
