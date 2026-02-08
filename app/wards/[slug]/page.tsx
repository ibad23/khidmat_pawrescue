"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, Trash2, ArrowRightLeft, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { formatCatId, formatCageNo, formatDate, getErrorMessage } from "@/lib/utils";
import { EditWardDialog } from "@/components/dialogs/EditWardDialog";
import type { Ward, CageDetail } from "@/lib/types";
import usePermissions from "@/hooks/usePermissions";
import useAuth from "@/hooks/useAuth";

interface CageRow {
  cage_id: number;
  cage_no: number;
  ward_id: number;
  ward_code: string;
  cage_status: string;
  date: string | null;
  cat_id: number | null;
  cat_name: string | null;
}

export default function WardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canEdit, canDelete } = usePermissions();
  const { user } = useAuth();
  const wardId = params.slug as string;

  const [ward, setWard] = useState<Ward | null>(null);
  const [cages, setCages] = useState<CageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedCage, setSelectedCage] = useState<CageRow | null>(null);
  const [targetWardId, setTargetWardId] = useState("");
  const [allWards, setAllWards] = useState<Ward[]>([]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showDeleteCageDialog, setShowDeleteCageDialog] = useState(false);
  const [cageToDelete, setCageToDelete] = useState<CageRow | null>(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const loadWardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/cages/read?ward_id=${wardId}`);
      const { data: cageData, ward: wardInfo } = res.data;

      if (wardInfo) {
        // Fetch full ward data to get cage counts
        const wardRes = await axios.get(`/api/wards/read?ward_id=${wardId}`);
        setWard(wardRes.data?.data || null);
      }

      setCages(cageData || []);
    } catch (err) {
      console.error("Failed to load ward data", err);
      toast.error("Failed to load ward data");
    } finally {
      setLoading(false);
    }
  }, [wardId]);

  const loadAllWards = useCallback(async () => {
    try {
      const res = await axios.get("/api/wards/read");
      setAllWards(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load wards", err);
    }
  }, []);

  useEffect(() => {
    loadWardData();
    loadAllWards();
  }, [loadWardData, loadAllWards]);

  // Refetch data when window regains focus (e.g., user comes back from another page)
  useEffect(() => {
    const handleFocus = () => {
      loadWardData();
      loadAllWards();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadWardData, loadAllWards]);

  const filteredCages = useMemo(() => {
    return cages.filter((cage) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "occupied" && cage.cage_status === "Occupied") return true;
      if (statusFilter === "vacant" && cage.cage_status === "Free") return true;
      return false;
    });
  }, [cages, statusFilter]);

  const handleResetFilter = () => {
    setStatusFilter("all");
  };

  const handleDeleteCage = async (cage: CageRow) => {
    if (cage.cage_status === "Occupied") {
      toast.error("Cannot delete occupied cage. Remove the cat first.");
      return;
    }

    setIsDeleting(cage.cage_id);
    try {
      await axios.delete("/api/cages/delete", {
        data: { cage_id: cage.cage_id, currentUserEmail: user?.email },
      });
      toast.success("Cage deleted successfully");
      setShowDeleteCageDialog(false);
      setCageToDelete(null);
      setCages((prev) => prev.filter((c) => c.cage_id !== cage.cage_id));
      // Update ward data
      if (ward) {
        setWard({
          ...ward,
          totalCages: ward.totalCages - 1,
          freeCages: ward.freeCages - 1,
        });
      }
    } catch (err) {
      console.error("Failed to delete cage", err);
      toast.error(getErrorMessage(err, "Failed to delete cage"));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleTransferClick = (cage: CageRow) => {
    if (cage.cage_status === "Occupied") {
      toast.error("Cannot transfer occupied cage. Remove the cat first.");
      return;
    }
    setSelectedCage(cage);
    setTargetWardId("");
    setShowTransferDialog(true);
  };

  const handleTransfer = async () => {
    if (!selectedCage || !targetWardId) {
      toast.error("Please select a target ward");
      return;
    }

    setIsTransferring(true);
    try {
      await axios.patch("/api/cages/transfer", {
        cage_id: selectedCage.cage_id,
        target_ward_id: Number(targetWardId),
        currentUserEmail: user?.email,
      });
      toast.success("Cage transferred successfully");
      setShowTransferConfirm(false);
      setSelectedCage(null);
      // Reload data
      loadWardData();
    } catch (err) {
      console.error("Failed to transfer cage", err);
      toast.error(getErrorMessage(err, "Failed to transfer cage"));
    } finally {
      setIsTransferring(false);
    }
  };

  const handleEditWard = (updatedWard: Ward) => {
    setWard(updatedWard);
    // Reload cages in case count changed
    loadWardData();
  };

  // Other wards for transfer (excluding current ward)
  const otherWards = useMemo(() => {
    return allWards.filter((w) => w.ward_id !== Number(wardId));
  }, [allWards, wardId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          <Card className="bg-card border-border p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="py-4 px-4">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ward) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Ward Not Found</h2>
          <p className="text-muted-foreground mb-4">The ward you are looking for does not exist.</p>
          <Button onClick={() => router.push("/wards")}>Back to Wards</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/wards")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Wards / {ward.name}
            </button>
            <h1 className="text-3xl font-bold text-foreground">{ward.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {ward.totalCages} total cages | {ward.freeCages} free | {ward.totalCages - ward.freeCages} occupied
            </p>
          </div>
          {canEdit && (
            <Button
              onClick={() => setShowEditDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Edit Ward Details
            </Button>
          )}
        </div>

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">Filter By</span>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
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
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cage ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat Name</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No cages found.
                  </td>
                </tr>
              ) : (
                filteredCages.map((cage) => (
                  <tr key={cage.cage_id} className="border-b border-border hover:bg-card/50">
                    <td className="py-4 px-4 text-foreground">
                      {formatCageNo(cage.cage_no, cage.ward_code || ward.code)}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {cage.cat_id ? formatCatId(cage.cat_id) : "-"}
                    </td>
                    <td className="py-4 px-4 text-foreground">{cage.cat_name || "-"}</td>
                    <td className="py-4 px-4 text-foreground">
                      {cage.date ? formatDate(cage.date) : "-"}
                    </td>
                    <td className="py-4 px-4">
                      {cage.cage_status === "Occupied" ? (
                        <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
                          Occupied
                        </Badge>
                      ) : (
                        <Badge className="bg-status-success/20 text-status-success hover:bg-status-success/30">
                          Vacant
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {cage.cage_status !== "Occupied" && (canEdit || canDelete) && (
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-destructive/90"
                              onClick={() => handleTransferClick(cage)}
                              disabled={isDeleting === cage.cage_id || otherWards.length === 0}
                              title="Transfer to another ward"
                            >
                              <ArrowRightLeft className="w-4 h-4 text-foreground"/>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => { setCageToDelete(cage); setShowDeleteCageDialog(true); }}
                              disabled={isDeleting === cage.cage_id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditWardDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        ward={ward}
        onEdit={handleEditWard}
        currentUserEmail={user?.email}
      />

      {/* Transfer Cage Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Transfer Cage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-foreground">
              Transfer cage <span className="font-semibold">{selectedCage && formatCageNo(selectedCage.cage_no, selectedCage.ward_code || ward?.code)}</span> to another ward.
            </p>
            <Select value={targetWardId} onValueChange={setTargetWardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target ward" />
              </SelectTrigger>
              <SelectContent>
                {otherWards.map((w) => (
                  <SelectItem key={w.ward_id} value={String(w.ward_id)}>
                    {w.name} ({w.freeCages} free cages)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-primary"
              onClick={() => setShowTransferDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => { setShowTransferDialog(false); setShowTransferConfirm(true); }}
              disabled={!targetWardId}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Cage Confirmation Dialog */}
      <Dialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirm Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-foreground">
              Are you sure you want to transfer cage <span className="font-semibold">{selectedCage && formatCageNo(selectedCage.cage_no, selectedCage.ward_code || ward?.code)}</span> to <span className="font-semibold">{otherWards.find(w => String(w.ward_id) === targetWardId)?.name || "Unknown"}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-primary"
                onClick={() => { setShowTransferConfirm(false); setShowTransferDialog(true); }}
                disabled={isTransferring}
              >
                Back
              </Button>
              <Button
                onClick={handleTransfer}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isTransferring}
              >
                {isTransferring ? "Transferring..." : "Confirm Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Cage Confirmation Dialog */}
      <Dialog open={showDeleteCageDialog} onOpenChange={setShowDeleteCageDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Cage</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-foreground">
              Are you sure you want to delete cage <span className="font-semibold">{cageToDelete ? formatCageNo(cageToDelete.cage_no, cageToDelete.ward_code || ward?.code) : ""}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-primary"
                onClick={() => setShowDeleteCageDialog(false)}
                disabled={isDeleting !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={() => { if (cageToDelete) handleDeleteCage(cageToDelete); }}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={isDeleting !== null}
              >
                {isDeleting !== null ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
