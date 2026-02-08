"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils";

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

    if (!wardName.trim()) {
      toast.error("Please enter a Ward Name");
      return;
    }
    if (!cageCode.trim()) {
      toast.error("Please enter a Ward Cage Code");
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
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to add ward"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
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
                onClick={() => setCageCount(Math.max(0, cageCount - 1))}
                disabled={cageCount === 0}
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
              {isSubmitting ? "Adding..." : "Add Ward"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWardDialog;
