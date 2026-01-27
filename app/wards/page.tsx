"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Filter, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { AddWardDialog } from "@/components/dialogs/AddWardDialog";
import { EditWardDialog } from "@/components/dialogs/EditWardDialog";
import { DeleteWardDialog } from "@/components/dialogs/DeleteWardDialog";

const initialWardsData = [
  { name: "General Ward", code: "GW", totalCages: 10, freeCages: 5 },
  { name: "ICU", code: "ICU", totalCages: 10, freeCages: 5 },
  { name: "Lounge", code: "LG", totalCages: 10, freeCages: 5 },
  { name: "Recovery", code: "RC", totalCages: 10, freeCages: 5 },
  { name: "Quarantine", code: "QT", totalCages: 10, freeCages: 5 },
];

export default function WardsPage() {
  const router = useRouter();
  const [wards, setWards] = useState(initialWardsData);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [wardFilter, setWardFilter] = useState("");

  const filteredWards = wards.filter((ward) => {
    if (wardFilter && wardFilter !== "all" && ward.name !== wardFilter) return false;
    return true;
  });

  const handleResetFilter = () => {
    setWardFilter("");
  };

  const handleEdit = (e: React.MouseEvent, ward: any) => {
    e.stopPropagation();
    setSelectedWard(ward);
    setShowEditDialog(true);
  };

  const handleEditSubmit = (updatedWard: any) => {
    setWards(wards.map((w) => (w === selectedWard ? updatedWard : w)));
  };

  const handleDelete = (e: React.MouseEvent, ward: any) => {
    e.stopPropagation();
    setSelectedWard(ward);
    setShowDeleteDialog(true);
  };

  const handleAddWard = (newWard: any) => {
    setWards([...wards, newWard]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Wards</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add New Ward
          </Button>
        </div>

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Filter className="w-5 h-5" />
            </Button>

            <Button variant="outline" className="gap-2">
              Filter By
            </Button>

            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="General Ward">General Ward</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Lounge">Lounge</SelectItem>
                <SelectItem value="Recovery">Recovery</SelectItem>
                <SelectItem value="Quarantine">Quarantine</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors" onClick={handleResetFilter}>
              <RotateCcw className="w-4 h-4" />
              Reset Filter
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredWards.map((ward, index) => (
            <Card
              key={index}
              className="bg-card border-border p-6 cursor-pointer hover:bg-card/80 transition-colors"
              onClick={() => router.push(`/wards/${ward.name.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <h3 className="text-xl font-semibold text-foreground min-w-[200px]">{ward.name}</h3>
                  <div className="flex items-center gap-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Code:</span>
                      <span className="text-muted-foreground">{ward.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Total Cages:</span>
                      <span className="text-muted-foreground">{ward.totalCages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Free Cages:</span>
                      <span className="text-muted-foreground">{ward.freeCages}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e: any) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e: any) => handleEdit(e, ward)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e: any) => handleDelete(e, ward)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AddWardDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddWard} />
      <EditWardDialog open={showEditDialog} onOpenChange={setShowEditDialog} ward={selectedWard} onEdit={handleEditSubmit} />
      <DeleteWardDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
    </DashboardLayout>
  );
}
