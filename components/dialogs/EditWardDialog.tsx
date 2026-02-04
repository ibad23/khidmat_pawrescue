"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
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

    if (!wardName.trim() || !cageCode.trim()) {
      toast.error("Ward name and cage code are required");
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
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || "Failed to update ward");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This code will be used as prefix for cage IDs (e.g., GW-C01)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Number of Cages</Label>
            <div className="flex items-center gap-3 bg-muted rounded-lg p-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full shrink-0"
                onClick={handleDecrease}
                disabled={isSubmitting || cageCount <= minCages}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={minCages}
                value={cageCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val < minCages) {
                    toast.error(`Cannot reduce below ${minCages} cages. ${minCages} cage(s) are occupied.`);
                    setCageCount(minCages);
                  } else {
                    setCageCount(val);
                  }
                }}
                className="text-center text-2xl font-semibold bg-background border-border h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full shrink-0"
                onClick={() => setCageCount(cageCount + 1)}
                disabled={isSubmitting}
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

          <div className="flex gap-4 justify-end pt-4">
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
