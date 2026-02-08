"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import axios from "axios";
import { formatCatId, formatForDatetimeLocal, getErrorMessage } from "@/lib/utils";

interface EditTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: any;
  onEdit?: (treatment: any) => void;
  currentUserEmail?: string;
}

export const EditTreatmentDialog = ({ open, onOpenChange, treatment, onEdit, currentUserEmail }: EditTreatmentDialogProps) => {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [catIdSearch, setCatIdSearch] = useState("");
  const [catNameSearch, setCatNameSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [showCatIdDropdown, setShowCatIdDropdown] = useState(false);
  const [showCatNameDropdown, setShowCatNameDropdown] = useState(false);

  const [formData, setFormData] = useState({
    temp: 100,
    treatment: "",
    id: undefined as number | undefined,
  });

  const [dateTimeLocal, setDateTimeLocal] = useState<string>(() => formatForDatetimeLocal(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cats from API
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/cats/read');
        setCats(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch cats', err);
      } finally {
        setLoading(false);
      }
    };
    if (open) fetchCats();
  }, [open]);

  // Auto-fill form when treatment data is provided
  useEffect(() => {
    if (treatment && cats.length > 0) {
      const tempStr = String(treatment.temp || "100").replace(/[°F]/g, "");
      const tempNum = Number(tempStr) || 100;

      // Find the cat in the cats list
      const cat = cats.find(c => c.cat_id === treatment.catIdNum);
      if (cat) {
        setSelectedCat(cat);
        setCatIdSearch(formatCatId(cat.cat_id));
        setCatNameSearch(cat.cat_name);
      } else {
        setCatIdSearch(treatment.catId || "");
        setCatNameSearch(treatment.catName || "");
      }

      setFormData({
        temp: tempNum,
        treatment: treatment.treatment || "",
        id: treatment.id,
      });

      // Parse the time from treatment
      const dt = treatment.time ? new Date(treatment.time) : new Date();
      if (!isNaN(dt.getTime())) {
        setDateTimeLocal(formatForDatetimeLocal(dt));
      }
    }
  }, [treatment, cats]);

  // Filter cats based on ID search
  const filteredCatsById = useMemo(() => {
    if (!catIdSearch) return cats;
    const search = catIdSearch.toLowerCase();
    return cats.filter(cat =>
      formatCatId(cat.cat_id).toLowerCase().includes(search) ||
      String(cat.cat_id).includes(search)
    );
  }, [cats, catIdSearch]);

  // Filter cats based on name search
  const filteredCatsByName = useMemo(() => {
    if (!catNameSearch) return cats;
    const search = catNameSearch.toLowerCase();
    return cats.filter(cat =>
      cat.cat_name?.toLowerCase().includes(search)
    );
  }, [cats, catNameSearch]);

  const selectCat = (cat: any) => {
    setSelectedCat(cat);
    setCatIdSearch(formatCatId(cat.cat_id));
    setCatNameSearch(cat.cat_name);
    setShowCatIdDropdown(false);
    setShowCatNameDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedCat) {
      toast.error("Please select a Cat");
      return;
    }
    if (!dateTimeLocal) {
      toast.error("Please select a Date / Time");
      return;
    }
    if (!formData.treatment.trim()) {
      toast.error("Please enter Treatment Details");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTimeISO = new Date(dateTimeLocal).toISOString();

      const payload = {
        treatment_id: Number(formData.id),
        cat_id: selectedCat.cat_id,
        temperature: `${formData.temp}°F`,
        treatment: formData.treatment,
        date_time: dateTimeISO,
        currentUserEmail,
      };

      const resp = await axios.patch('/api/treatments/update', payload);
      if (resp.status !== 200) throw new Error(resp.data?.error || 'Failed to update treatment');

      const updated = resp.data.data;
      const mapped = {
        id: updated.treatment_id,
        catIdNum: updated.cat_id,
        catId: formatCatId(updated.cat_id),
        catName: updated.cats?.cat_name || "",
        cageNo: updated.cats?.cage?.cage_no || "",
        temp: updated.temperature || `${formData.temp}°F`,
        treatment: updated.treatment || formData.treatment,
        time: updated.date_time ? new Date(updated.date_time).toLocaleString() : new Date().toLocaleString(),
        givenBy: updated.users?.user_name || "",
      };

      onEdit?.(mapped);
      toast.success('Treatment updated successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "An error occurred while updating treatment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Cat ID Search */}
            <div className="space-y-2 relative">
              <Label>Cat ID</Label>
              <Input
                value={catIdSearch}
                onChange={(e) => {
                  setCatIdSearch(e.target.value);
                  setSelectedCat(null);
                  setShowCatIdDropdown(true);
                  setShowCatNameDropdown(false);
                }}
                onFocus={() => setShowCatIdDropdown(true)}
                placeholder={loading ? "Loading..." : "Search Cat ID"}
                className="bg-muted border-border"
                disabled={loading}
              />
              {showCatIdDropdown && filteredCatsById.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredCatsById.slice(0, 10).map(cat => (
                    <div
                      key={cat.cat_id}
                      className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                      onClick={() => selectCat(cat)}
                    >
                      {formatCatId(cat.cat_id)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cat Name Search */}
            <div className="space-y-2 relative">
              <Label>Cat Name</Label>
              <Input
                value={catNameSearch}
                onChange={(e) => {
                  setCatNameSearch(e.target.value);
                  setSelectedCat(null);
                  setShowCatNameDropdown(true);
                  setShowCatIdDropdown(false);
                }}
                onFocus={() => setShowCatNameDropdown(true)}
                placeholder={loading ? "Loading..." : "Search Cat Name"}
                className="bg-muted border-border"
                disabled={loading}
              />
              {showCatNameDropdown && filteredCatsByName.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredCatsByName.slice(0, 10).map(cat => (
                    <div
                      key={cat.cat_id}
                      className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                      onClick={() => selectCat(cat)}
                    >
                      {cat.cat_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Show selected cat info */}
          {selectedCat && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">Selected: </span>
              <span className="font-medium">{formatCatId(selectedCat.cat_id)} - {selectedCat.cat_name}</span>
              {selectedCat.cage?.cage_no && (
                <span className="text-muted-foreground"> (Cage {selectedCat.cage.cage_no})</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Date / Time</Label>
            <Input
              type="datetime-local"
              value={dateTimeLocal}
              onChange={(e) => setDateTimeLocal(e.target.value)}
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Temperature</Label>
            <div className="flex items-center gap-4 bg-muted rounded-lg p-3">
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90 h-10 w-10"
                onClick={() => setFormData({ ...formData, temp: Math.max(0, formData.temp - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-medium flex-1 text-center">{formData.temp}°F</span>
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90 h-10 w-10"
                onClick={() => setFormData({ ...formData, temp: Math.min(115, formData.temp + 1) })}
              >
                <Plus className="h-4 w-4" />
              </Button>
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

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || !selectedCat}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTreatmentDialog;
