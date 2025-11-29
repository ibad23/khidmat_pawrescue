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

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (transaction: any) => void;
}

export const AddTransactionDialog = ({ open, onOpenChange, onAdd }: AddTransactionDialogProps) => {
  const [formData, setFormData] = useState({
    billFor: "Chicken",
    mode: "cash",
    amount: "1000 PKR",
    remarks: "-",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction = {
      id: `T-${String(Date.now()).slice(-4)}`,
      billFor: formData.billFor,
      amount: formData.amount,
      mode: formData.mode,
      remarks: formData.remarks,
      date: new Date().toLocaleDateString(),
    };
    onAdd?.(newTransaction);
    toast.success("Transaction added successfully");
    onOpenChange(false);
    setFormData({ billFor: "", amount: "", mode: "cash", remarks: "" });
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
          <DialogTitle className="text-3xl font-bold">Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Bill For</Label>
            <Input
              value={formData.billFor}
              onChange={(e) => setFormData({ ...formData, billFor: e.target.value })}
              className="bg-muted border-border"
              required
            />
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
              placeholder="Enter amount (e.g., 5000 PKR)"
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
              className="bg-muted border-border min-h-[200px]"
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Revenue
            </Button>
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
