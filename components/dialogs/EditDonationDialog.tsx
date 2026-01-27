"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Donation } from "@/lib/types";

interface EditDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation?: Donation | null;
  onEdit?: () => void;
}

export const EditDonationDialog = ({ open, onOpenChange, donation, onEdit }: EditDonationDialogProps) => {
  const [formData, setFormData] = useState({ donorName: "", contactNo: "", mode: "", amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (donation) {
      setFormData({
        donorName: donation.donor_name || "",
        contactNo: donation.contact_num || "",
        mode: donation.mode || "",
        amount: String(donation.amount || ""),
      });
    }
  }, [donation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !donation) return;
    setIsSubmitting(true);
    try {
      await axios.patch("/api/donations/update", {
        donation_id: donation.donation_id,
        donor_name: formData.donorName,
        contact_num: formData.contactNo,
        mode: formData.mode,
        amount: formData.amount,
      });
      onEdit?.();
      toast.success("Donation updated successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-50">
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-3xl font-bold">Edit Donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Donor Name</Label>
            <Input value={formData.donorName} onChange={(e) => setFormData({ ...formData, donorName: e.target.value })} className="bg-muted border-border" required />
          </div>
          <div className="space-y-2">
            <Label>Contact No.</Label>
            <Input value={formData.contactNo} onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })} className="bg-muted border-border" required />
          </div>
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v })} required>
              <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Select mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="bg-muted border-border" required />
          </div>
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDonationDialog;
