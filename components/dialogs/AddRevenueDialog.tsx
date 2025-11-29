"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (revenue: any) => void;
}

export const AddRevenueDialog = ({ open, onOpenChange, onAdd }: AddRevenueDialogProps) => {
  const [formData, setFormData] = useState({
    name: "PA-001",
    contactNo: "03124589301",
    mode: "cash",
    amount: "1000  PKR",
    remarks: "Bought a Collar",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRevenue = {
      id: `R-${String(Date.now()).slice(-4)}`,
      name: formData.name,
      contact: formData.contactNo,
      amount: formData.amount,
      mode: formData.mode,
      remarks: formData.remarks,
      date: new Date().toLocaleDateString(),
    };
    onAdd?.(newRevenue);
    toast.success("Revenue added successfully");
    onOpenChange(false);
    setFormData({ name: "", contactNo: "", amount: "", mode: "cash", remarks: "" });
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
          <DialogTitle className="text-3xl font-bold">Add New Revenue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Contact No.</Label>
              <Input
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Mode</Label>
            <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })} required>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
            <Input
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount (e.g., 2000 PKR)"
              className="bg-muted border-border"
              required
            />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="bg-muted border-border min-h-[150px]"
              required
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Revenue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRevenueDialog;
