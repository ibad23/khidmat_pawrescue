"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils";
import type { Ward } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface DeleteWardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ward?: Ward | null;
  onDelete?: (wardId: number) => void;
  currentUserEmail?: string;
}

export const DeleteWardDialog = ({ open, onOpenChange, ward, onDelete, currentUserEmail }: DeleteWardDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if ward can be deleted (no occupied cages)
  const canDelete = ward ? ward.freeCages === ward.totalCages : false;
  const occupiedCount = ward ? ward.totalCages - ward.freeCages : 0;

  const handleDelete = async () => {
    if (!ward || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await axios.delete("/api/wards/delete", {
        data: { ward_id: ward.ward_id, currentUserEmail },
      });

      if (res.data?.success) {
        onDelete?.(ward.ward_id);
        toast.success("Ward deleted successfully");
        onOpenChange(false);
      } else {
        throw new Error(res.data?.error || "Failed to delete ward");
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to delete ward"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canDelete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Cannot Delete Ward
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-foreground">
              {occupiedCount > 0
                ? `This ward has ${occupiedCount} occupied cage(s). Please remove cats from all cages before deleting this ward.`
                : "You need to remove all cats from cages in this ward before it can be deleted."}
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Okay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Delete Ward</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-foreground">
            Are you sure you want to delete <span className="font-semibold">{ward?.name}</span>?
            {ward && ward.totalCages > 0 && (
              <> This will also delete all {ward.totalCages} cage(s) in this ward.</>
            )}
            {" "}This action cannot be undone.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-primary"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWardDialog;
