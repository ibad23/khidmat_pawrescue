"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatCatId, formatCageNo, formatPhoneInput, isValidPhone } from "@/lib/utils";

interface External {
  external_id: number;
  name: string;
  contact_num: string;
  address: string;
}

interface AddCatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (cat: any) => void;
}

export const AddCatDialog = ({ open, onOpenChange, onAdd }: AddCatDialogProps) => {
  const [formData, setFormData] = useState({
    catName: "",
    age: "",
    gender: "",
    type: "",
    cageId: "",
    status: "",
    ownerName: "",
    contactNo: "",
    address: "",
  });

  const [cageOptions, setCageOptions] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [externals, setExternals] = useState<External[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find matching external based on owner name
  const matchingExternal = useMemo(() => {
    if (!formData.ownerName.trim()) return null;
    return externals.find(
      (ext) => ext.name?.toLowerCase() === formData.ownerName.toLowerCase().trim()
    );
  }, [formData.ownerName, externals]);

  // Auto-fill contact and address when owner name matches
  useEffect(() => {
    if (matchingExternal) {
      setFormData((prev) => ({
        ...prev,
        contactNo: formatPhoneInput(matchingExternal.contact_num || prev.contactNo),
        address: matchingExternal.address || prev.address,
      }));
    }
  }, [matchingExternal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.gender) {
      toast.error("Please select a Gender");
      return;
    }
    if (!formData.type) {
      toast.error("Please select a Type");
      return;
    }
    if (!formData.cageId) {
      toast.error("Please select a Cage");
      return;
    }
    if (!formData.status) {
      toast.error("Please select a Status");
      return;
    }
    if (formData.contactNo && !isValidPhone(formData.contactNo)) {
      toast.error("Contact No. must be exactly 11 digits");
      return;
    }

    if (formData.age) {
      const age = Number(formData.age);
      if (isNaN(age) || age < 0) {
        toast.error("Age in months cannot be negative");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        cat_name: formData.catName,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || null,
        type: formData.type || null,
        cage_id: formData.cageId ? Number(formData.cageId) : null,
        status: formData.status || null,
        owner_name: formData.ownerName || null,
        contact_num: formData.contactNo || null,
        address: formData.address || null,
      };

      const res = await axios.post("/api/cats/create", payload);
      const created = res.data?.data;
      if (!created) throw new Error(res.data?.error || "Create failed");

      const mapped = {
        id: formatCatId(created.cat_id),
        name: created.cat_name,
        owner: created.externals?.name || "",
        contact: created.externals?.contact_num || "",
        date: created.admitted_on ? new Date(created.admitted_on).toLocaleDateString() : "",
        type: created.type || "",
        cage: created.cage?.cage_no ? formatCageNo(created.cage.cage_no) : "-",
        status: created.status || "",
        color: "purple",
      };

      onAdd?.(mapped);
      toast.success("Cat added successfully");
      onOpenChange(false);
      setFormData({
        catName: "",
        age: "",
        gender: "",
        type: "",
        cageId: "",
        status: "",
        ownerName: "",
        contactNo: "",
        address: "",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to add cat");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [cageRes, statusRes, externalsRes] = await Promise.all([
          axios.get("/api/cages/free"),
          axios.get("/api/cats/statuses"),
          axios.get("/api/externals/read"),
        ]);
        setCageOptions(cageRes.data?.data || []);
        setStatusOptions(statusRes.data?.data || []);
        setExternals(externalsRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    if (open) {
      loadOptions();
    }
  }, [open]);

  // Get unique owner names for autocomplete
  const ownerSuggestions = useMemo(() => {
    return externals.filter((ext) => ext.name).map((ext) => ext.name);
  }, [externals]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add a New Cat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cat ID</Label>
              <Input
                placeholder="System Will generate ID"
                className="bg-muted border-border"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Cat Name</Label>
              <Input
                placeholder="Enter Cat's Name"
                className="bg-muted border-border"
                required
                value={formData.catName}
                onChange={(e) => setFormData({ ...formData, catName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Age (Months)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="Age in months"
                className="bg-muted border-border"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pet">Pet</SelectItem>
                  <SelectItem value="Rescued">Rescued</SelectItem>
                  <SelectItem value="Stray">Stray</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cage No.</Label>
              <Select value={formData.cageId} onValueChange={(value) => setFormData({ ...formData, cageId: value })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {cageOptions.map((c) => (
                    <SelectItem key={c.cage_id} value={String(c.cage_id)}>{formatCageNo(c.cage_no, c.ward_code)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Owner / Reporter Name</Label>
              <Input
                placeholder="Enter Owner Name"
                className="bg-muted border-border"
                required
                list="owner-suggestions"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
              <datalist id="owner-suggestions">
                {ownerSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {matchingExternal && (
                <p className="text-xs text-muted-foreground">
                  Existing owner found - contact and address auto-filled
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Contact No.</Label>
              <Input
                placeholder="0XXX-XXXXXXX"
                className="bg-muted border-border"
                required
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: formatPhoneInput(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              placeholder="Enter Address"
              className="bg-muted border-border"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
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
              {isSubmitting ? "Adding..." : "Add Cat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCatDialog;
