"use client";

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteWardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteWardDialog = ({ open, onOpenChange }: DeleteWardDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Cannot Delete Ward</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            You need to delete the cages of this ward from cats data first to delete this ward.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Okay
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWardDialog;
