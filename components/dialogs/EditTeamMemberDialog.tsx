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

interface EditTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onEdit?: (member: TeamMember) => void;
  currentUserEmail?: string;
}

export const EditTeamMemberDialog = ({ open, onOpenChange, member, onEdit, currentUserEmail }: EditTeamMemberDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: "",
  });
  const [roles, setRoles] = useState<InternalRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        roleId: String(member.roleId) || "",
      });
    }
  }, [member]);

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
    if (isSubmitting || !member) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: member.id,
        name: formData.name,
        email: formData.email,
        roleId: Number(formData.roleId),
        currentUserEmail,
      };

      const res = await axios.patch("/api/team/update", payload);
      const updatedMember = res.data.data;

      toast.success("Team member updated successfully");
      onEdit?.(updatedMember);
      onOpenChange(false);
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to update team member";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Edit Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" className="text-primary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || loadingRoles}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamMemberDialog;
