"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter, RotateCcw, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { AddTreatmentDialog } from "@/components/dialogs/AddTreatmentDialog";
import { EditTreatmentDialog } from "@/components/dialogs/EditTreatmentDialog";
import { DeleteTreatmentDialog } from "@/components/dialogs/DeleteTreatmentDialog";
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
import { formatCatId } from "@/lib/utils";
import { Treatment } from "@/lib/types";

const ITEMS_PER_PAGE = 15;

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [catFilter, setCatFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadTreatments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/treatments/read');
      const rows = res.data?.data || [];
      const mapped: Treatment[] = rows.map((r: any) => ({
        id: r.treatment_id,
        catId: r.cat_id ? formatCatId(r.cat_id) : "",
        catIdNum: r.cat_id,
        catName: r.cats?.cat_name || "",
        cageNo: r.cats?.cage?.cage_no || r.cats?.cage_no || "",
        temp: r.temperature || "",
        treatment: r.treatment || "",
        time: r.date_time ? new Date(r.date_time).toLocaleString() : "",
        givenBy: r.users?.user_name || (r.user_id ? `User ${r.user_id}` : "")
      }));
      setTreatments(mapped);
    } catch (err) {
      console.error('Failed to load treatments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddTreatment = () => {
    loadTreatments();
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowEditDialog(true);
  };

  const handleEditSubmit = () => {
    loadTreatments();
  };

  const handleDeleteTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTreatment) return;
    try {
      const resp = await axios.delete('/api/treatments/delete', {
        data: { treatment_id: selectedTreatment.id }
      });
      if (resp.status === 200) {
        loadTreatments();
        setShowDeleteDialog(false);
        setSelectedTreatment(null);
      }
    } catch (err) {
      console.error('Failed to delete treatment', err);
    }
  };

  // Dynamic cat options from treatments data
  const catOptions = useMemo(() => {
    const cats = new Map<string, string>();
    treatments.forEach((t) => {
      if (t.catId && t.catName) {
        cats.set(t.catId, t.catName);
      }
    });
    return Array.from(cats.entries());
  }, [treatments]);

  // Filter treatments
  const filteredTreatments = useMemo(() => {
    return treatments.filter((treatment) => {
      if (catFilter && catFilter !== "all" && treatment.catId !== catFilter) return false;
      return true;
    });
  }, [treatments, catFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTreatments.length / ITEMS_PER_PAGE);
  const paginatedTreatments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTreatments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTreatments, currentPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [catFilter]);

  const handleResetFilter = () => {
    setCatFilter("all");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  useEffect(() => {
    loadTreatments();
  }, [loadTreatments]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Treatments</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add Treatment
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

            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Cat ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cats</SelectItem>
                {catOptions.map(([catId, catName]) => (
                  <SelectItem key={catId} value={catId}>{catId} - {catName}</SelectItem>
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
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cage No.</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Temp</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Treatment</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Time</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Given By</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-8 w-8 rounded" /></td>
                  </tr>
                ))
              ) : paginatedTreatments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No treatments found.
                  </td>
                </tr>
              ) : (
                paginatedTreatments.map((treatment) => (
                  <tr key={treatment.id} className="border-b border-border hover:bg-card/50">
                    <td className="py-4 px-4 text-foreground">{treatment.catId}</td>
                    <td className="py-4 px-4 text-foreground">{treatment.catName}</td>
                    <td className="py-4 px-4 text-foreground">{treatment.cageNo}</td>
                    <td className="py-4 px-4 text-foreground">{treatment.temp}</td>
                    <td className="py-4 px-4 text-foreground max-w-xs truncate">{treatment.treatment}</td>
                    <td className="py-4 px-4 text-foreground">{treatment.time}</td>
                    <td className="py-4 px-4 text-foreground">{treatment.givenBy}</td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTreatment(treatment)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTreatment(treatment)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTreatments.length)} of {filteredTreatments.length} treatments
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

      <AddTreatmentDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddTreatment} />
      <EditTreatmentDialog open={showEditDialog} onOpenChange={setShowEditDialog} treatment={selectedTreatment} onEdit={handleEditSubmit} />
      <DeleteTreatmentDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} onConfirm={confirmDelete} />
    </DashboardLayout>
  );
}
