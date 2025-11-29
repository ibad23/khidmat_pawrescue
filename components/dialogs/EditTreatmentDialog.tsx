"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EditTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: any;
  onEdit?: (treatment: any) => void;
}

export const EditTreatmentDialog = ({ open, onOpenChange, treatment, onEdit }: EditTreatmentDialogProps) => {
  const [formData, setFormData] = useState({
    catId: "",
    catName: "",
    cageNo: "",
    temp: "",
    treatment: "",
    time: "",
    givenBy: "",
  });

  useEffect(() => {
    if (treatment) {
      setFormData(treatment);
    }
  }, [treatment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit?.(formData);
    toast.success("Treatment updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cat ID</Label>
              <Input
                value={formData.catId}
                onChange={(e) => setFormData({ ...formData, catId: e.target.value })}
                placeholder="Enter Cat ID"
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cat Name</Label>
              <Input
                value={formData.catName}
                onChange={(e) => setFormData({ ...formData, catName: e.target.value })}
                placeholder="Enter Cat Name"
                className="bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cage No.</Label>
              <Input
                value={formData.cageNo}
                onChange={(e) => setFormData({ ...formData, cageNo: e.target.value })}
                placeholder="Enter Cage Number"
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input
                value={formData.temp}
                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                placeholder="Enter Temperature"
                className="bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Treatment Details</Label>
            <Textarea
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Enter treatment details"
              className="bg-muted border-border min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Given By</Label>
              <Input
                value={formData.givenBy}
                onChange={(e) => setFormData({ ...formData, givenBy: e.target.value })}
                placeholder="Enter doctor name"
                className="bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTreatmentDialog;
