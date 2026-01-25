"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamMember } from "@/lib/types";

interface DeleteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onConfirm?: () => void;
  isDeleting?: boolean;
}

export const DeleteTeamMemberDialog = ({
  open,
  onOpenChange,
  member,
  onConfirm,
  isDeleting = false
}: DeleteTeamMemberDialogProps) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Delete Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-foreground">
            Are you sure you want to delete <span className="font-semibold">{member?.name}</span>?
            This will remove their account and they will no longer be able to log in.
            This action cannot be undone.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-primary"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamMemberDialog;
