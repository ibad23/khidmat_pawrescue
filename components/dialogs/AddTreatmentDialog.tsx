"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (treatment: any) => void;
}

export const AddTreatmentDialog = ({ open, onOpenChange, onAdd }: AddTreatmentDialogProps) => {
  const [temp, setTemp] = useState(100);
  const [catId, setCatId] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTreatment = {
      id: `T-${String(Date.now()).slice(-4)}`,
      catId,
      time,
      temp: `${temp}°F`,
      treatment: details,
      date: new Date().toLocaleDateString(),
    };
    onAdd?.(newTreatment);
    toast.success("Treatment added successfully");
    onOpenChange(false);
    setCatId("");
    setTime("");
    setTemp(100);
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl">
        <DialogHeader>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-50"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-3xl font-bold">Add New Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select Cat ID</Label>
            <Select value={catId} onValueChange={setCatId} required>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select Cat ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PA-001">PA-001</SelectItem>
                <SelectItem value="PA-002">PA-002</SelectItem>
                <SelectItem value="PA-003">PA-003</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Time</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8:00 am">8:00 am</SelectItem>
                  <SelectItem value="12:00 pm">12:00 pm</SelectItem>
                  <SelectItem value="4:00 pm">4:00 pm</SelectItem>
                  <SelectItem value="8:00 pm">8:00 pm</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Treatment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTreatmentDialog;
