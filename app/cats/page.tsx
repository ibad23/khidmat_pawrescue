"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, MoreVertical } from "lucide-react";
import { AddCatDialog } from "@/components/dialogs/AddCatDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

const catsData = [
  { id: "PA-0001", name: "Renal", owner: "Mrs Hania", contact: "0321784020", date: "14 Feb 2019", type: "Pet", cage: "-", status: "Moved To Healthy", color: "success" },
  { id: "PA-0002", name: "Hungry", owner: "Noman", contact: "0321784020", date: "14 Feb 2019", type: "Rescue", cage: "-", status: "Expired", color: "danger" },
  { id: "PA-0003", name: "Sam", owner: "Sohaib", contact: "0321784020", date: "14 Feb 2019", type: "Rescue", cage: "GW-C03", status: "Under Treatment", color: "info" },
  { id: "PA-0004", name: "Wobbly", owner: "ASP Police", contact: "0321784020", date: "14 Feb 2019", type: "Pet", cage: "-", status: "Adopted", color: "warning" },
  { id: "PA-0005", name: "Sonia", owner: "Saba", contact: "0321784020", date: "14 Feb 2019", type: "Pet", cage: "-", status: "Discharged", color: "purple" },
  { id: "PA-0006", name: "Shah Sahab", owner: "Nisma", contact: "0321784020", date: "14 Feb 2019", type: "Rescue", cage: "-", status: "Fostered", color: "purple" },
];

const statusColors = {
  success: "bg-status-success/20 text-status-success",
  danger: "bg-status-danger/20 text-status-danger",
  info: "bg-status-info/20 text-status-info",
  warning: "bg-status-warning/20 text-status-warning",
  purple: "bg-status-purple/20 text-status-purple",
};

export default function CatsPage() {
  const router = useRouter();
  const [cats, setCats] = useState(catsData);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  const handleAddCat = (newCat: any) => {
    setCats([...cats, newCat]);
  };

  const handleEditCat = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    setSelectedCat(cat);
    setShowEditDialog(true);
  };

  const handleDeleteCat = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    setSelectedCat(cat);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setCats(cats.filter((c) => c.id !== selectedCat.id));
    setSelectedCat(null);
  };

  const filteredCats = cats.filter((cat) => {
    if (statusFilter && statusFilter !== "all" && cat.status !== statusFilter) return false;
    return true;
  });

  const handleResetFilter = () => {
    setDateFilter("");
    setStatusFilter("");
    setOwnerFilter("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Cats</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add New Cat
          </Button>
        </div>

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Filter className="w-5 h-5" />
            </Button>

            <Button variant="outline" className="gap-2">
              Filter By
            </Button>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="14 Feb 2019" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Under Treatment">Under Treatment</SelectItem>
                <SelectItem value="Moved To Healthy">Moved To Healthy</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Adopted">Adopted</SelectItem>
                <SelectItem value="Discharged">Discharged</SelectItem>
                <SelectItem value="Fostered">Fostered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Owner / Reporter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              className="gap-2 text-primary hover:bg-[hsl(var(--hover-light-yellow))]"
              onClick={handleResetFilter}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filter
            </Button>
          </div>
        </Card>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat Name</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Owner / Reporter</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Contact No.</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Type</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cage No.</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCats.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-border hover:bg-card/50 cursor-pointer"
                  onClick={() => router.push(`/cats/${cat.id}`)}
                >
                  <td className="py-4 px-4 text-foreground">{cat.id}</td>
                  <td className="py-4 px-4 text-foreground">{cat.name}</td>
                  <td className="py-4 px-4 text-foreground">{cat.owner}</td>
                  <td className="py-4 px-4 text-foreground">{cat.contact}</td>
                  <td className="py-4 px-4 text-foreground">{cat.date}</td>
                  <td className="py-4 px-4 text-foreground">{cat.type}</td>
                  <td className="py-4 px-4 text-foreground">{cat.cage}</td>
                  <td className="py-4 px-4">
                    <Badge className={(statusColors as any)[cat.color]}>{cat.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: any) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCatDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddCat} />
    </DashboardLayout>
  );
}
