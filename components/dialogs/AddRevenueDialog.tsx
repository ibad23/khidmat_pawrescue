"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";

interface External {
  external_id: number;
  name: string;
  contact_num: string;
  address: string | null;
}

interface AddRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: () => void;
}

export const AddRevenueDialog = ({ open, onOpenChange, onAdd }: AddRevenueDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    mode: "",
    amount: "",
    remarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [externals, setExternals] = useState<External[]>([]);
  const [nameMatches, setNameMatches] = useState<External[]>([]);
  const [showMatchPrompt, setShowMatchPrompt] = useState(false);
  const [selectedExternalId, setSelectedExternalId] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      axios.get("/api/externals/read").then((res) => {
        setExternals(res.data.data || []);
      }).catch(() => {});
    } else {
      setFormData({ name: "", contactNo: "", amount: "", mode: "", remarks: "" });
      setNameMatches([]);
      setShowMatchPrompt(false);
      setSelectedExternalId(null);
    }
  }, [open]);

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    setSelectedExternalId(null);
    setShowMatchPrompt(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim().length < 2) {
        setNameMatches([]);
        setShowMatchPrompt(false);
        return;
      }
      const matches = externals.filter(
        (e) => e.name.toLowerCase() === value.trim().toLowerCase()
      );
      if (matches.length > 0) {
        setNameMatches(matches);
        setShowMatchPrompt(true);
      } else {
        setNameMatches([]);
        setShowMatchPrompt(false);
      }
    }, 400);
  };

  const selectExisting = (ext: External) => {
    setFormData({ ...formData, name: ext.name, contactNo: ext.contact_num || "" });
    setSelectedExternalId(ext.external_id);
    setShowMatchPrompt(false);
  };

  const dismissMatch = () => {
    setShowMatchPrompt(false);
    setSelectedExternalId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/revenue/create", {
        name: formData.name,
        contact_num: formData.contactNo,
        mode: formData.mode,
        amount: formData.amount,
        remarks: formData.remarks,
      });
      onAdd?.();
      toast.success("Revenue added successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to add revenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add New Revenue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter buyer name"
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
                disabled={!!selectedExternalId}
              />
            </div>
          </div>

          {showMatchPrompt && nameMatches.length > 0 && (
            <div className="border border-border rounded-md p-3 bg-muted space-y-2">
              <p className="text-sm text-muted-foreground">
                A person with this name already exists. Is this the same person?
              </p>
              {nameMatches.map((ext) => (
                <div key={ext.external_id} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {ext.name} — {ext.contact_num || "No contact"}
                  </span>
                  <Button type="button" size="sm" variant="outline" onClick={() => selectExisting(ext)}>
                    Yes, same person
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="ghost" className="text-primary" onClick={dismissMatch}>
                No, create new
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })} required>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
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
              placeholder="Enter remarks"
              className="bg-muted border-border min-h-[150px]"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Revenue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRevenueDialog;
