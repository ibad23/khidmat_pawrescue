"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Filter, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { AddWardDialog } from "@/components/dialogs/AddWardDialog";
import { EditWardDialog } from "@/components/dialogs/EditWardDialog";
import { DeleteWardDialog } from "@/components/dialogs/DeleteWardDialog";
import type { Ward } from "@/lib/types";

export default function WardsPage() {
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [wardFilter, setWardFilter] = useState("");

  const loadWards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/wards/read");
      const data = res.data?.data || [];
      setWards(data);
    } catch (err) {
      console.error("Failed to load wards", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWards();
  }, [loadWards]);

  // Refetch data when window regains focus (e.g., user comes back from another page)
  useEffect(() => {
    const handleFocus = () => {
      loadWards();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadWards]);

  const filteredWards = useMemo(() => {
    return wards.filter((ward) => {
      if (wardFilter && wardFilter !== "all" && ward.name !== wardFilter) return false;
      return true;
    });
  }, [wards, wardFilter]);

  const handleResetFilter = () => {
    setWardFilter("");
  };

  const handleEdit = (e: React.MouseEvent, ward: Ward) => {
    e.stopPropagation();
    setSelectedWard(ward);
    setShowEditDialog(true);
  };

  const handleEditSubmit = (updatedWard: Ward) => {
    setWards((prev) =>
      prev.map((w) => (w.ward_id === updatedWard.ward_id ? updatedWard : w))
    );
  };

  const handleDelete = (e: React.MouseEvent, ward: Ward) => {
    e.stopPropagation();
    setSelectedWard(ward);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = (wardId: number) => {
    setWards((prev) => prev.filter((w) => w.ward_id !== wardId));
  };

  const handleAddWard = (newWard: Ward) => {
    setWards((prev) => [...prev, newWard]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Wards</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add New Ward
          </Button>
        </div>

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Filter className="w-5 h-5" />
            </Button>

            <span className="text-sm text-muted-foreground">Filter By</span>

            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((ward) => (
                  <SelectItem key={ward.ward_id} value={ward.name}>
                    {ward.name}
                  </SelectItem>
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

        <div className="space-y-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <Skeleton className="h-6 w-40" />
                    <div className="flex items-center gap-8">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </Card>
            ))
          ) : filteredWards.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center text-muted-foreground">
              No wards found.
            </Card>
          ) : (
            filteredWards.map((ward) => (
              <Card
                key={ward.ward_id}
                className="bg-card border-border p-6 cursor-pointer hover:bg-card/80 transition-colors"
                onClick={() => router.push(`/wards/${ward.ward_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <h3 className="text-xl font-semibold text-foreground min-w-[200px]">{ward.name}</h3>
                    <div className="flex items-center gap-8 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Code:</span>
                        <span className="text-muted-foreground">{ward.code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Total Cages:</span>
                        <span className="text-muted-foreground">{ward.totalCages}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Free Cages:</span>
                        <span className="text-muted-foreground">{ward.freeCages}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => handleEdit(e, ward)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e: React.MouseEvent<HTMLDivElement>) => handleDelete(e, ward)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AddWardDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddWard} />
      <EditWardDialog open={showEditDialog} onOpenChange={setShowEditDialog} ward={selectedWard} onEdit={handleEditSubmit} />
      <DeleteWardDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} ward={selectedWard} onDelete={handleDeleteConfirm} />
    </DashboardLayout>
  );
}
