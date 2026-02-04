"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Transaction } from "@/lib/types";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onEdit?: () => void;
  currentUserEmail?: string;
}

export const EditTransactionDialog = ({ open, onOpenChange, transaction, onEdit, currentUserEmail }: EditTransactionDialogProps) => {
  const [formData, setFormData] = useState({ billFor: "", mode: "", amount: "", remarks: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        billFor: transaction.bill_for || "",
        mode: transaction.mode || "",
        amount: String(transaction.amount || ""),
        remarks: transaction.remarks || "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !transaction) return;

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.patch("/api/transactions/update", {
        transaction_id: transaction.transaction_id,
        bill_for: formData.billFor,
        mode: formData.mode,
        amount: formData.amount,
        remarks: formData.remarks,
        currentUserEmail,
      });
      onEdit?.();
      toast.success("Transaction updated successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Bill For</Label>
            <Input value={formData.billFor} onChange={(e) => setFormData({ ...formData, billFor: e.target.value })} className="bg-muted border-border" required />
          </div>
          <div className="grid grid-cols-2 gap-6">
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
              <Input type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="bg-muted border-border" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="bg-muted border-border min-h-[150px]" />
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

export default EditTransactionDialog;
