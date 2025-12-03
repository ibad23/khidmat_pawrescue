"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AddTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (treatment: any) => void;
  // optional: a pre-selected cat id (numeric string or number) – useful on cat detail pages
  initialCatId?: string | number;
}

export const AddTreatmentDialog = ({ open, onOpenChange, onAdd, initialCatId }: AddTreatmentDialogProps) => {
  const [temp, setTemp] = useState(100);
  const [catId, setCatId] = useState("");
  const [catName, setCatName] = useState("");
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const formatForDatetimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [dateTimeLocal, setDateTimeLocal] = useState<string>(() => formatForDatetimeLocal(new Date()));
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              setCatId(String(found.cat_id));
              setCatName(found.cat_name);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // guard against multiple clicks
    setIsSubmitting(true);

    try {
      // Use the form's datetime-local value (auto-filled when the dialog opens)
      const dateTimeISO = new Date(dateTimeLocal).toISOString();
      // Post the treatment to the create API route
      // Convert the selected cat id (may be `PA-0001`) to a numeric id for the DB
      const catDigits = String(catId).match(/\d+/);
      const catIdNum = catDigits ? Number(catDigits[0]) : Number(catId);
      if (!catIdNum || Number.isNaN(catIdNum)) {
        toast.error("Invalid Cat ID selected");
        setIsSubmitting(false);
        return;
      }

      // Temporary: set a default user id to associate this treatment with an existing user in DB
      const defaultUserId = 1;

      // do it with axios to leverage its error handling
      const resp = await axios.post("/api/treatments/create", {
        cat_id: catIdNum,
        user_id: defaultUserId,
        // user_id: you can include the current user id here if available
        date_time: dateTimeISO,
        temperature: `${temp}°F`,
        treatment: details,
      });
      
      const json = resp.data;
      if (resp.status !== 201) throw new Error(json?.error || "Failed to add treatment");

      // Map returned data to what the UI expects and pass to the onAdd callback if provided
      const inserted = json.data;
      const mappedTreatment = {
        catId: inserted.cat_id ? String(inserted.cat_id) : "",
        catName: inserted.cats?.cat_name || "",
        cageNo: inserted.cats?.cage?.cage_no || inserted.cats?.cage_no || "",
        temp: inserted.temperature || `${temp}°F`,
        treatment: inserted.treatment || details,
        time: inserted.date_time ? new Date(inserted.date_time).toLocaleString() : new Date().toLocaleString(),
        givenBy: inserted.users?.user_name || (inserted.user_id ? `User ${inserted.user_id}` : ""),
      };

      onAdd?.(mappedTreatment);
      toast.success("Treatment added successfully");
      onOpenChange(false);
      setCatId("");
      setCatName("");
      setDateTimeLocal(formatForDatetimeLocal(new Date()));
      setTemp(100);
      setDetails("");
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while adding treatment");
    }
    finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) setDateTimeLocal(formatForDatetimeLocal(new Date()));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add New Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select Cat Name</Label>
            <Select value={catName} onValueChange={(name) => {
              const found = cats.find(c => c.cat_name === name);
              if (found) {
                setCatName(name);
                setCatId(String(found.cat_id));
              }
            }} disabled={loading}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder={loading ? "Loading..." : "Select Cat Name"} />
              </SelectTrigger>
              <SelectContent>
                {cats.map(cat => (
                  <SelectItem key={cat.cat_id} value={cat.cat_name}>{cat.cat_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cat ID</Label>
            <Input
              value={catId ? `PA-${String(catId).padStart(3, '0')}` : ""}
              disabled
              placeholder="Auto-filled"
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Date / Time</Label>
            <Input
              type="datetime-local"
              value={dateTimeLocal}
              disabled
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
              <Label>Temp</Label>
              <div className="flex items-center gap-4 bg-muted rounded-lg p-3">
                <Button
                  type="button"
                  size="icon"
                  className="bg-primary hover:bg-primary/90 h-10 w-10"
                  onClick={() => setTemp(Math.max(0, temp - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-medium flex-1 text-center">{temp} F</span>
                <Button
                  type="button"
                  size="icon"
                  className="bg-primary hover:bg-primary/90 h-10 w-10"
                  onClick={() => setTemp(temp + 1)}
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
              className="bg-muted border-border min-h-[200px]"
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
              disabled={isSubmitting}
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
