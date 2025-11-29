"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddWardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (ward: any) => void;
}

export const AddWardDialog = ({ open, onOpenChange, onAdd }: AddWardDialogProps) => {
  const [cageCount, setCageCount] = useState(0);
  const [wardName, setWardName] = useState("");
  const [cageCode, setCageCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWard = {
      name: wardName,
      code: cageCode,
      totalCages: cageCount,
      freeCages: cageCount,
    };
    onAdd?.(newWard);
    toast.success("Ward added successfully");
    onOpenChange(false);
    setWardName("");
    setCageCode("");
    setCageCount(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-50"
          >
            <X className="h-5 w-5" />
          </button>
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
          </div>

          <div className="space-y-2">
            <Label>No of Cages</Label>
            <div className="flex items-center gap-4 bg-muted rounded-lg p-4">
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setCageCount(Math.max(0, cageCount - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-medium flex-1 text-center">{cageCount}</span>
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setCageCount(cageCount + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Ward
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWardDialog;
