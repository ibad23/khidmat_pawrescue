"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { InternalRole, TeamMember } from "@/lib/types";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (member: TeamMember) => void;
}

export const AddTeamMemberDialog = ({ open, onOpenChange, onAdd }: AddTeamMemberDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  });
  const [roles, setRoles] = useState<InternalRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles when dialog opens
  useEffect(() => {
    if (open) {
      const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
          const res = await axios.get("/api/internal-roles/read");
          setRoles(res.data.data || []);
        } catch (err) {
          console.error("Failed to fetch roles:", err);
          toast.error("Failed to load roles");
        } finally {
          setLoadingRoles(false);
        }
      };
      fetchRoles();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate password length
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        roleId: Number(formData.roleId),
        password: formData.password,
      };

      const res = await axios.post("/api/team/create", payload);
      const newMember = res.data.data;

      toast.success("Team member added successfully");
      onAdd?.(newMember);
      onOpenChange(false);

      // Reset form
      setFormData({ name: "", email: "", roleId: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to add team member";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add New Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              required
              disabled={loadingRoles}
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.internal_role_id} value={String(role.internal_role_id)}>
                    {role.role_desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className="bg-muted border-border"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="bg-muted border-border"
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Use a strong password with at least 8 characters.
            </p>
          </div>

          <div className="flex gap-4 justify-end pt-2">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || loadingRoles}
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberDialog;
