"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import axios from "axios";

interface EditTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: any;
  onEdit?: (treatment: any) => void;
}

export const EditTreatmentDialog = ({ open, onOpenChange, treatment, onEdit }: EditTreatmentDialogProps) => {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    catId: "",
    catName: "",
    cageNo: "",
    temp: 100 as number,
    treatment: "",
    id: undefined as number | undefined,
  });

  const formatForDatetimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
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
    fetchCats();
  }, []);

  // Auto-fill form when treatment data is provided
  useEffect(() => {
    if (treatment) {
      const tempStr = String(treatment.temp || "100").replace(/[°F]/g, "");
      const tempNum = Number(tempStr) || 100;
      const numericCatId = String(treatment.catIdNum || "");
      
      setFormData({
        catId: numericCatId,
        catName: treatment.catName || "",
        cageNo: treatment.cageNo || "",
        temp: tempNum,
        treatment: treatment.treatment || "",
        id: treatment.id,
      });
      const dt = (treatment?.date_time && new Date(treatment.date_time)) || new Date();
      setDateTimeLocal(formatForDatetimeLocal(dt));
    }
  }, [treatment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Build payload with only the fields that need to be updated
      const payload = {
        treatment_id: Number(formData.id),
        cat_id: Number(formData.catId),
        temperature: formData.temp,
        treatment: formData.treatment,
      };

      // send PATCH request with axios to leverage its error handling
      const resp = await axios.patch('/api/treatments/update', payload);
      const json = resp.data;
      if (resp.status !== 200) throw new Error(json?.error || 'Failed to update treatment');

      // Map updated data back to the UI format
      const updated = json.data;
      const mapped = {
        id: updated.treatment_id,
        catIdNum: updated.cat_id,
        catId: `PA-${String(updated.cat_id).padStart(3, '0')}`,
        catName: updated.cats?.cat_name || "",
        cageNo: updated.cats?.cage?.cage_no || "",
        temp: updated.temperature || formData.temp,
        treatment: updated.treatment || formData.treatment,
        time: updated.date_time ? new Date(updated.date_time).toLocaleString() : new Date().toLocaleString(),
      };

      // Call parent callback to refresh the table
      onEdit?.(mapped);
      toast.success('Treatment updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred while updating treatment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        {/** no manual close button here — Dialog already renders a close icon */}
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Cat ID Dropdown */}
            <div className="space-y-2">
              <Label>Cat ID</Label>
              <Select value={formData.catId || ""} onValueChange={(val) => {
                const selectedCat = cats.find(c => String(c.cat_id) === val);
                if (selectedCat) {
                  setFormData({
                    catId: val,
                    catName: selectedCat.cat_name,
                    cageNo: selectedCat.cage?.cage_no || "",
                    temp: formData.temp,
                    treatment: formData.treatment,
                    id: formData.id,
                  });
                }
              }}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select Cat ID" />
                </SelectTrigger>
                <SelectContent>
                  {cats.map(cat => (
                    <SelectItem key={cat.cat_id} value={String(cat.cat_id)}>{`PA-${String(cat.cat_id).padStart(3, '0')}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cat Name Dropdown */}
            <div className="space-y-2">
              <Label>Cat Name</Label>
              <Select value={formData.catName || ""} onValueChange={(val) => {
                const selectedCat = cats.find(c => c.cat_name === val);
                if (selectedCat) {
                  setFormData({
                    catId: String(selectedCat.cat_id),
                    catName: val,
                    cageNo: selectedCat.cage?.cage_no || "",
                    temp: formData.temp,
                    treatment: formData.treatment,
                    id: formData.id,
                  });
                }
              }}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select Cat Name" />
                </SelectTrigger>
                <SelectContent>
                  {cats.map(cat => (
                    <SelectItem key={cat.cat_id} value={cat.cat_name}>{cat.cat_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cage Number Dropdown */}
          <div className="space-y-2">
            <Label>Cage No.</Label>
            <Select value={formData.cageNo || ""} onValueChange={(val) => {
              const selectedCat = cats.find(c => c.cage?.cage_no === val);
              if (selectedCat) {
                setFormData({
                  catId: String(selectedCat.cat_id),
                  catName: selectedCat.cat_name,
                  cageNo: val,
                  temp: formData.temp,
                  treatment: formData.treatment,
                  id: formData.id,
                });
              }
            }}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select Cage No." />
              </SelectTrigger>
              <SelectContent>
                {cats.map(cat => (
                  <SelectItem key={cat.cat_id} value={cat.cage?.cage_no || ""}>{cat.cage?.cage_no || "N/A"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <span className="text-xl font-medium flex-1 text-center">{formData.temp} F</span>
              <Button
                type="button"
                size="icon"
                className="bg-primary hover:bg-primary/90 h-10 w-10"
                onClick={() => setFormData({ ...formData, temp: formData.temp + 1 })}
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

          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="datetime-local"
              value={dateTimeLocal}
              disabled
              className="bg-muted border-border"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTreatmentDialog;
