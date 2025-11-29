"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTeamMemberDialog } from "@/components/dialogs/AddTeamMemberDialog";

const initialTeamMembers = [
  { name: "Ahmad Bilal", role: "Admin", email: "crazy_bilal@gmail.com" },
  { name: "Maida Butt", role: "Admin", email: "maida.aftab.butt@gmail.com" },
  { name: "AR", role: "Admin", email: "anamrafiq@gmail.com" },
  { name: "Hunain Theba", role: "Admin", email: "hunain.theba@gmail.com" },
  { name: "Dr Sajdeen", role: "Moderator", email: "sajdeen@gmail.com" },
  { name: "Syeda Maryum", role: "Moderator", email: "syeda.marry@gmail.com" },
];

export default function TeamPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  const handleAddMember = (newMember: any) => {
    setTeamMembers([...teamMembers, newMember]);
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
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-card border-border p-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                <AvatarFallback className="text-xl">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </Card>
          ))}
        </div>
      </div>

      <AddTeamMemberDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddMember} />
    </DashboardLayout>
  );
}
