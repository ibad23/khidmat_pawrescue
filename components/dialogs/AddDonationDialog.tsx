"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (donation: any) => void;
}

export const AddDonationDialog = ({ open, onOpenChange, onAdd }: AddDonationDialogProps) => {
  const [formData, setFormData] = useState({
    donorName: "",
    contactNo: "",
    mode: "",
    amount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation = {
      id: `D-${String(Date.now()).slice(-4)}`,
      donor: formData.donorName,
      contact: formData.contactNo,
      amount: formData.amount,
      mode: formData.mode,
      date: new Date().toLocaleDateString(),
    };
    onAdd?.(newDonation);
    toast.success("Donation added successfully");
    onOpenChange(false);
    setFormData({ donorName: "", contactNo: "", amount: "", mode: "" });
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
          <DialogTitle className="text-3xl font-bold">Add New Donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Donor Name</Label>
            <Input
              value={formData.donorName}
              onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
              placeholder="Enter donor name"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Contact No.</Label>
            <Input
              value={formData.contactNo}
              onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              placeholder="03XX-XXXXXXX"
              className="bg-muted border-border"
              required
            />
          </div>

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
              placeholder="Enter amount (e.g., 1000 PKR)"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Donation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDonationDialog;
