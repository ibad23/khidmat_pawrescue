"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

interface AddWardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (ward: any) => void;
}

export const AddWardDialog = ({ open, onOpenChange, onAdd }: AddWardDialogProps) => {
  const [cageCount, setCageCount] = useState(0);
  const [wardName, setWardName] = useState("");
  const [cageCode, setCageCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setWardName("");
    setCageCode("");
    setCageCount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!wardName.trim() || !cageCode.trim()) {
      toast.error("Ward name and cage code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: wardName.trim(),
        code: cageCode.trim().toUpperCase(),
        totalCages: cageCount,
      };

      const res = await axios.post("/api/wards/create", payload);
      const created = res.data?.data;

      if (!created) {
        throw new Error(res.data?.error || "Failed to create ward");
      }

      onAdd?.(created);
      toast.success("Ward added successfully");
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || "Failed to add ward");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add New Ward</DialogTitle>
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
                onClick={() => setCageCount(Math.max(0, cageCount - 1))}
                disabled={isSubmitting || cageCount === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="0"
                value={cageCount}
                onChange={(e) => setCageCount(Math.max(0, parseInt(e.target.value) || 0))}
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
              {isSubmitting ? "Adding..." : "Add Ward"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWardDialog;
