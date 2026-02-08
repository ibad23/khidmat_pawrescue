"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils";
import type { Ward } from "@/lib/types";

interface EditWardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ward?: Ward | null;
  onEdit?: (ward: Ward) => void;
  currentUserEmail?: string;
}

export const EditWardDialog = ({ open, onOpenChange, ward, onEdit, currentUserEmail }: EditWardDialogProps) => {
  const [cageCount, setCageCount] = useState(ward?.totalCages || 0);
  const [wardName, setWardName] = useState(ward?.name || "");
  const [cageCode, setCageCode] = useState(ward?.code || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate minimum cage count (occupied cages)
  const minCages = ward ? ward.totalCages - ward.freeCages : 0;

  useEffect(() => {
    if (ward) {
      setCageCount(ward.totalCages);
      setWardName(ward.name);
      setCageCode(ward.code);
    }
  }, [ward]);

  const handleDecrease = () => {
    if (cageCount > minCages) {
      setCageCount(cageCount - 1);
    } else {
      toast.error(`Cannot reduce below ${minCages} cages. ${minCages} cage(s) are occupied.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !ward) return;

    if (!wardName.trim()) {
      toast.error("Please enter a Ward Name");
      return;
    }
    if (!cageCode.trim()) {
      toast.error("Please enter a Ward Cage Code");
      return;
    }

    if (cageCount < minCages) {
      toast.error(`Cannot have fewer than ${minCages} cages. ${minCages} cage(s) are occupied.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ward_id: ward.ward_id,
        name: wardName.trim(),
        code: cageCode.trim().toUpperCase(),
        totalCages: cageCount,
        currentUserEmail,
      };

      const res = await axios.patch("/api/wards/update", payload);
      const updated = res.data?.data;

      if (!updated) {
        throw new Error(res.data?.error || "Failed to update ward");
      }

      onEdit?.(updated);
      toast.success("Ward details updated successfully");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update ward"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Ward Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Ward Name</Label>
            <Input
              value={wardName}
              onChange={(e) => setWardName(e.target.value)}
              placeholder="Enter Ward Name"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Ward Cage Code</Label>
            <Input
              value={cageCode}
              onChange={(e) => setCageCode(e.target.value)}
              placeholder="Enter Code for Cage e.g GW"
              className="bg-muted border-border"
              required
            />
            <p className="text-xs text-muted-foreground">
              This code will be used as prefix for cage IDs (e.g., GW-C01)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Number of Cages</Label>
            <div className="flex items-center gap-4 bg-muted rounded-lg p-3">
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90 h-10 w-10"
                onClick={handleDecrease}
                disabled={cageCount <= minCages}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-medium flex-1 text-center">{cageCount}</span>
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90 h-10 w-10"
                onClick={() => setCageCount(cageCount + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {minCages > 0 && (
              <p className="text-xs text-muted-foreground">
                Minimum {minCages} cage(s) required ({minCages} currently occupied)
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-primary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWardDialog;
