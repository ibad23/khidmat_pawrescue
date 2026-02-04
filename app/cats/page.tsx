"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, ExternalLink } from "lucide-react";
import { AddCatDialog } from "@/components/dialogs/AddCatDialog";
import { EditCatDialog } from "@/components/dialogs/EditCatDialog";
import { DeleteCatDialog } from "@/components/dialogs/DeleteCatDialog";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { formatCatId, formatCageNo, mapStatusToColor, formatDate } from "@/lib/utils";
import { STATUS_COLORS, STATUS_DOT_COLORS, STATUS_RING_COLORS, Cat } from "@/lib/types";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import usePermissions from "@/hooks/usePermissions";

interface CatRaw {
  cat_id: number;
  cat_name: string;
  age: number | null;
  gender: string;
  type: string;
  cage_id: number | null;
  status: string;
  admitted_on: string | null;
  cage: {
    cage_id: number;
    cage_no: number;
    ward?: { ward_id: number; code: string } | null;
  } | null;
  externals: {
    external_id: number;
    name: string;
    contact_num: string;
    address: string;
  } | null;
}

interface CatForEdit {
  cat_id: number;
  cat_name: string;
  age: number | null;
  gender: string;
  type: string;
  cage_id: number | null;
  cage_no: number | null;
  status: string;
  owner_name: string;
  contact_num: string;
  address: string;
}

export default function CatsPage() {
  const router = useRouter();
  const { canEdit, canDelete } = usePermissions();
  const [cats, setCats] = useState<Cat[]>([]);
  const [catsRaw, setCatsRaw] = useState<CatRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCat, setSelectedCat] = useState<CatForEdit | null>(null);
  const [selectedCatForDelete, setSelectedCatForDelete] = useState<{ id: string; name: string; cat_id: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const loadCats = useCallback(async () => {
    try {
      setLoading(true);
      const [catsRes, statusRes] = await Promise.all([
        axios.get("/api/cats/read"),
        axios.get("/api/cats/statuses"),
      ]);
      const rows: CatRaw[] = catsRes.data?.data || [];
      setCatsRaw(rows);
      const mapped: Cat[] = rows.map((r) => ({
        id: formatCatId(r.cat_id),
        cat_id: r.cat_id,
        name: r.cat_name || "",
        owner: r.externals?.name || "",
        contact: r.externals?.contact_num || "",
        date: r.admitted_on ? formatDate(r.admitted_on) : "",
        admitted_on_raw: r.admitted_on || null,
        type: r.type || "",
        cage: r.cage?.cage_no ? formatCageNo(r.cage.cage_no, r.cage.ward?.code) : "-",
        status: r.status || "",
        color: mapStatusToColor(r.status),
      }));
      setCats(mapped);
      setStatusOptions(statusRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load cats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  const handleAddCat = () => {
    loadCats();
  };

  const handleEditCat = (cat: Cat) => {
    const raw = catsRaw.find((r) => r.cat_id === cat.cat_id);
    if (raw) {
      setSelectedCat({
        cat_id: raw.cat_id,
        cat_name: raw.cat_name,
        age: raw.age,
        gender: raw.gender,
        type: raw.type,
        cage_id: raw.cage_id,
        cage_no: raw.cage?.cage_no || null,
        status: raw.status,
        owner_name: raw.externals?.name || "",
        contact_num: raw.externals?.contact_num || "",
        address: raw.externals?.address || "",
      });
      setShowEditDialog(true);
    }
  };

  const handleEditSubmit = () => {
    loadCats();
  };

  const handleDeleteCat = (cat: Cat) => {
    setSelectedCatForDelete({ id: cat.id, name: cat.name, cat_id: cat.cat_id });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedCatForDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete("/api/cats/delete", {
        data: { cat_id: selectedCatForDelete.cat_id },
      });
      toast.success("Cat deleted successfully");
      loadCats();
      setShowDeleteDialog(false);
      setSelectedCatForDelete(null);
    } catch (err: any) {
      console.error("Failed to delete cat", err);
      toast.error(err?.response?.data?.error || "Failed to delete cat");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (cat: Cat, newStatus: string) => {
    if (updatingStatus) return;
    setUpdatingStatus(cat.cat_id);
    try {
      await axios.patch("/api/cats/update", {
        cat_id: cat.cat_id,
        status: newStatus,
      });
      toast.success("Status updated");
      // Update local state immediately
      setCats((prev) =>
        prev.map((c) =>
          c.cat_id === cat.cat_id
            ? { ...c, status: newStatus, color: mapStatusToColor(newStatus) }
            : c
        )
      );
      setCatsRaw((prev) =>
        prev.map((c) =>
          c.cat_id === cat.cat_id
            ? { ...c, status: newStatus }
            : c
        )
      );
    } catch (err: any) {
      console.error("Failed to update status", err);
      toast.error(err?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const ownerOptions = useMemo(() => {
    const s = new Set<string>();
    cats.forEach((c) => { if (c.owner) s.add(c.owner); });
    return Array.from(s);
  }, [cats]);

  const filteredCats = useMemo(() => {
    return cats.filter((cat) => {
      if (statusFilter && statusFilter !== "all" && cat.status !== statusFilter) return false;
      if (ownerFilter && ownerFilter !== "all" && cat.owner !== ownerFilter) return false;

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
  }, [cats, statusFilter, ownerFilter, dateFilter]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedCats,
    goToPage,
    getPageNumbers,
    startIndex,
    endIndex,
  } = usePagination(filteredCats, {
    itemsPerPage: 15,
    resetDeps: [dateFilter, statusFilter, ownerFilter],
  });

  const handleResetFilter = () => {
    setDateFilter("");
    setStatusFilter("all");
    setOwnerFilter("all");
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

            <span className="text-sm text-muted-foreground">Filter By</span>

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
              variant="outline"
              className="gap-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors"
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
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-8 w-8 rounded" /></td>
                  </tr>
                ))
              ) : paginatedCats.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No cats found.
                  </td>
                </tr>
              ) : (
                paginatedCats.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border hover:bg-card/50 cursor-pointer group transition-colors"
                    onClick={() => router.push(`/cats/${cat.id}`)}
                  >
                    <td className="py-4 px-4 text-foreground font-medium">{cat.id}</td>
                    <td className="py-4 px-4 text-foreground">{cat.name}</td>
                    <td className="py-4 px-4 text-foreground">{cat.owner}</td>
                    <td className="py-4 px-4 text-foreground">{cat.contact}</td>
                    <td className="py-4 px-4 text-foreground">{cat.date}</td>
                    <td className="py-4 px-4 text-foreground">{cat.type}</td>
                    <td className="py-4 px-4 text-foreground">{cat.cage}</td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="inline-flex items-center gap-1 focus:outline-none"
                            disabled={updatingStatus === cat.cat_id}
                          >
                            <Badge className={`${STATUS_COLORS[cat.color]} ring-2 ${STATUS_RING_COLORS[cat.color]} ${updatingStatus === cat.cat_id ? "opacity-50" : ""}`}>
                              {cat.status}
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {statusOptions.map((s) => {
                            const itemColor = mapStatusToColor(s);
                            return (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => handleStatusChange(cat, s)}
                                className={s === cat.status ? "bg-accent" : ""}
                              >
                                <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[itemColor]} mr-2`} />
                                {s}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        {(canEdit || canDelete) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEdit && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditCat(cat); }}>
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canEdit && canDelete && <DropdownMenuSeparator />}
                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat); }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {filteredCats.length} cats
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page, index) => (
                typeof page === "number" ? (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`h-8 w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className="px-2 text-muted-foreground">...</span>
                )
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddCatDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddCat} />
      <EditCatDialog open={showEditDialog} onOpenChange={setShowEditDialog} cat={selectedCat} onEdit={handleEditSubmit} />
      <DeleteCatDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        catName={selectedCatForDelete?.name || ""}
        catId={selectedCatForDelete?.id || ""}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}
