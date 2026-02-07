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
import { formatCageNo, formatPhoneInput, isValidPhone } from "@/lib/utils";

interface External {
  external_id: number;
  name: string;
  contact_num: string;
  address: string;
}

interface CatData {
  cat_id: number;
  cat_name: string;
  age: number | null;
  gender: string;
  type: string;
  cage_id: number | null;
  cage_no: number | null;
  status: string;
  owner_name: string;
  contact_num: string;
  address: string;
}

interface EditCatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cat: CatData | null;
  onEdit?: () => void;
  currentUserEmail?: string;
}

export const EditCatDialog = ({ open, onOpenChange, cat, onEdit, currentUserEmail }: EditCatDialogProps) => {
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
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Populate form when cat changes
  useEffect(() => {
    if (cat) {
      setFormData({
        catName: cat.cat_name || "",
        age: cat.age !== null ? String(cat.age) : "",
        gender: cat.gender || "",
        type: cat.type || "",
        cageId: cat.cage_id !== null ? String(cat.cage_id) : "none",
        status: cat.status || "",
        ownerName: cat.owner_name || "",
        contactNo: formatPhoneInput(cat.contact_num || ""),
        address: cat.address || "",
      });
    }
  }, [cat]);

  // Find matching external based on owner name
  const matchingExternal = useMemo(() => {
    if (!formData.ownerName.trim()) return null;
    return externals.find(
      (ext) => ext.name?.toLowerCase() === formData.ownerName.toLowerCase().trim()
    );
  }, [formData.ownerName, externals]);

  // Auto-fill contact and address when owner name matches (only if different from current)
  useEffect(() => {
    if (matchingExternal && cat) {
      // Only auto-fill if it's a different owner than the current one
      if (matchingExternal.name !== cat.owner_name) {
        setFormData((prev) => ({
          ...prev,
          contactNo: formatPhoneInput(matchingExternal.contact_num || prev.contactNo),
          address: matchingExternal.address || prev.address,
        }));
      }
    }
  }, [matchingExternal, cat]);

  // Get unique owner names for autocomplete
  const ownerSuggestions = useMemo(() => {
    return externals.filter((ext) => ext.name).map((ext) => ext.name);
  }, [externals]);

  // Combined cage options: free cages + current cage if assigned
  const allCageOptions = useMemo(() => {
    if (!cat?.cage_id || !cat?.cage_no) return cageOptions;

    // Check if current cage is already in the free list
    const currentCageInList = cageOptions.some((c) => c.cage_id === cat.cage_id);
    if (currentCageInList) return cageOptions;

    // Add current cage to the list
    return [
      { cage_id: cat.cage_id, cage_no: cat.cage_no, isCurrent: true },
      ...cageOptions,
    ];
  }, [cageOptions, cat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !cat) return;

    if (!formData.gender) {
      toast.error("Please select a Gender");
      return;
    }
    if (!formData.type) {
      toast.error("Please select a Type");
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
        cat_id: cat.cat_id,
        cat_name: formData.catName,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || null,
        type: formData.type || null,
        cage_id: formData.cageId && formData.cageId !== "none" ? Number(formData.cageId) : null,
        status: formData.status || null,
        owner_name: formData.ownerName || null,
        contact_num: formData.contactNo || null,
        address: formData.address || null,
        old_cage_id: cat.cage_id,
        currentUserEmail,
      };

      const res = await axios.patch("/api/cats/update", payload);
      if (res.data?.error) throw new Error(res.data.error);

      toast.success("Cat updated successfully");
      onEdit?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || "Failed to update cat");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
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
      } finally {
        setLoadingOptions(false);
      }
    };
    if (open) {
      loadOptions();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Cat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cat ID</Label>
              <Input
                value={cat ? `PA-${String(cat.cat_id).padStart(4, "0")}` : ""}
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
              <Select
                value={formData.cageId}
                onValueChange={(value) => setFormData({ ...formData, cageId: value })}
                disabled={loadingOptions}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder={loadingOptions ? "Loading..." : "Please Select"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Cage</SelectItem>
                  {allCageOptions.map((c) => (
                    <SelectItem key={c.cage_id} value={String(c.cage_id)}>
                      {formatCageNo(c.cage_no, c.ward_code)}{c.isCurrent ? " (Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={loadingOptions}
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder={loadingOptions ? "Loading..." : "Please Select"} />
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
                list="owner-suggestions-edit"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
              <datalist id="owner-suggestions-edit">
                {ownerSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {matchingExternal && matchingExternal.name !== cat?.owner_name && (
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
              disabled={isSubmitting || loadingOptions}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCatDialog;
