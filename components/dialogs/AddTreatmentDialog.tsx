"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { formatCatId, formatForDatetimeLocal } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";

interface AddTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (treatment: any) => void;
  initialCatId?: string | number;
}

export const AddTreatmentDialog = ({ open, onOpenChange, onAdd, initialCatId }: AddTreatmentDialogProps) => {
  const { user } = useAuth();
  const [temp, setTemp] = useState(100);
  const [catIdSearch, setCatIdSearch] = useState("");
  const [catNameSearch, setCatNameSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateTimeLocal, setDateTimeLocal] = useState<string>(() => formatForDatetimeLocal(new Date()));
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCatIdDropdown, setShowCatIdDropdown] = useState(false);
  const [showCatNameDropdown, setShowCatNameDropdown] = useState(false);

  // Fetch cats from API on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/cats/read');
        setCats(res.data.data || []);

        // If initialCatId provided, set cat details
        if (initialCatId) {
          const initId = String(initialCatId).match(/\d+/);
          const numId = initId ? Number(initId[0]) : undefined;
          if (numId) {
            const found = res.data.data?.find((c: any) => c.cat_id === numId);
            if (found) {
              setSelectedCat(found);
              setCatIdSearch(formatCatId(found.cat_id));
              setCatNameSearch(found.cat_name);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch cats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, [initialCatId]);

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
    if (!details.trim()) {
      toast.error("Please enter Treatment Details");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTimeISO = new Date(dateTimeLocal).toISOString();

      const resp = await axios.post("/api/treatments/create", {
        cat_id: selectedCat.cat_id,
        user_email: user?.email,
        date_time: dateTimeISO,
        temperature: `${temp}°F`,
        treatment: details,
      });

      if (resp.status !== 201) throw new Error(resp.data?.error || "Failed to add treatment");

      onAdd?.(resp.data.data);
      toast.success("Treatment added successfully");
      onOpenChange(false);

      // Reset form
      setCatIdSearch("");
      setCatNameSearch("");
      setSelectedCat(null);
      setDateTimeLocal(formatForDatetimeLocal(new Date()));
      setTemp(100);
      setDetails("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "An error occurred while adding treatment");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      setDateTimeLocal(formatForDatetimeLocal(new Date()));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add New Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onClick={() => setTemp(Math.max(0, temp - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-medium flex-1 text-center">{temp}°F</span>
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90 h-10 w-10"
                onClick={() => setTemp(Math.min(115, temp + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Treatment Details</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter treatment details (e.g., IV given, Dressing done)"
              className="bg-muted border-border min-h-[100px]"
              required
            />
          </div>

          <div className="flex gap-4 justify-end pt-2">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || !selectedCat}
            >
              {isSubmitting ? "Saving..." : "Add Treatment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTreatmentDialog;
