"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

export const DeleteRevenueDialog = ({ open, onOpenChange, onConfirm }: DeleteRevenueDialogProps) => {
  const handleConfirm = () => {
    onConfirm?.();
    toast.success("Revenue deleted successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Delete Revenue</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-foreground">
            Are you sure you want to delete this revenue entry? This action cannot be undone.
          </p>
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRevenueDialog;
