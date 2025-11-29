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
    cageNo: "",
    status: "",
    ownerName: "",
    contactNo: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat = {
      id: `PA-${String(Date.now()).slice(-4)}`,
      name: formData.catName,
      age: formData.age,
      gender: formData.gender,
      type: formData.type,
      cage: formData.cageNo,
      status: formData.status,
      owner: formData.ownerName,
      contact: formData.contactNo,
    };
    onAdd?.(newCat);
    toast.success("Cat added successfully");
    onOpenChange(false);
    setFormData({
      catName: "",
      age: "",
      gender: "",
      type: "",
      cageNo: "",
      status: "",
      ownerName: "",
      contactNo: "",
      address: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-50"
          >
            <X className="h-5 w-5" />
          </button>
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
              <Label>Age</Label>
              <Select value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 yrs</SelectItem>
                  <SelectItem value="1-2">1-2 yrs</SelectItem>
                  <SelectItem value="2-3">2-3 yrs</SelectItem>
                  <SelectItem value="3+">3+ yrs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
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
                  <SelectItem value="rescued">Rescued</SelectItem>
                  <SelectItem value="stray">Stray</SelectItem>
                  <SelectItem value="owned">Owned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cage No.</Label>
              <Select value={formData.cageNo} onValueChange={(value) => setFormData({ ...formData, cageNo: value })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GW-C01">GW-C01</SelectItem>
                  <SelectItem value="GW-C02">GW-C02</SelectItem>
                  <SelectItem value="ICU-C01">ICU-C01</SelectItem>
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
                <SelectItem value="under-treatment">Under Treatment</SelectItem>
                <SelectItem value="recovered">Recovered</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Owner/ Reporter Name</Label>
              <Input
                placeholder="Enter Owner Name"
                className="bg-muted border-border"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact No.</Label>
              <Input
                placeholder="xxx-xxx-xxx"
                className="bg-muted border-border"
                required
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
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
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Cat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCatDialog;
