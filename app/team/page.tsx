"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTeamMemberDialog } from "@/components/dialogs/AddTeamMemberDialog";
import { EditTeamMemberDialog } from "@/components/dialogs/EditTeamMemberDialog";
import { DeleteTeamMemberDialog } from "@/components/dialogs/DeleteTeamMemberDialog";
import { TeamMember } from "@/lib/types";
import { toast } from "sonner";
import axios from "axios";
import useAuth from "@/hooks/useAuth";

export default function TeamPage() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/team/read");
      setTeamMembers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const handleAddMember = (newMember: TeamMember) => {
    setTeamMembers((prev) => [...prev, newMember]);
  };

  const handleEditMember = (updatedMember: TeamMember) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
  };

  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    setIsDeleting(true);
    try {
      const currentUserEmail = user?.email || "";
      await axios.delete("/api/team/delete", {
        data: { id: selectedMember.id, currentUserEmail }
      });
      setTeamMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      toast.success("Team member deleted successfully");
      setShowDeleteDialog(false);
      setSelectedMember(null);
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to delete team member";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Team</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add New Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={index}
                  className="bg-card border-border p-6 flex flex-col items-center text-center"
                >
                  <Skeleton className="w-24 h-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </Card>
              ))
            : teamMembers.map((member) => (
                <Card
                  key={member.id}
                  className="bg-card border-border p-6 flex flex-col items-center text-center relative"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(member)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(member)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </Card>
              ))}
        </div>

        {!loading && teamMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No team members found.</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="link"
              className="mt-2"
            >
              Add your first team member
            </Button>
          </div>
        )}
      </div>

      <AddTeamMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddMember}
      />

      <EditTeamMemberDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={selectedMember}
        onEdit={handleEditMember}
        currentUserEmail={user?.email}
      />

      <DeleteTeamMemberDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        member={selectedMember}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}
