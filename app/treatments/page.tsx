"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter, RotateCcw, MoreVertical } from "lucide-react";
import { AddTreatmentDialog } from "@/components/dialogs/AddTreatmentDialog";
import { EditTreatmentDialog } from "@/components/dialogs/EditTreatmentDialog";
import { DeleteTreatmentDialog } from "@/components/dialogs/DeleteTreatmentDialog";
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

const treatmentsData = [
  { catId: "PA-0001", catName: "Renal", cageNo: "GW-C01", temp: "100 F", treatment: "Treatment will go here", time: "8:00 am", givenBy: "Dr Sajdeen" },
  { catId: "PA-0001", catName: "Renal", cageNo: "GW-C01", temp: "100 F", treatment: "Treatment will go here", time: "10:00 pm", givenBy: "Dr Sajdeen" },
  { catId: "PA-0003", catName: "Sam", cageNo: "GW-C03", temp: "100 F", treatment: "Treatment will go here", time: "8:00 am", givenBy: "Dr Sajdeen" },
  { catId: "PA-0004", catName: "Wobbly", cageNo: "GW-C04", temp: "100 F", treatment: "Treatment will go here", time: "10:00 pm", givenBy: "Dr Sajdeen" },
  { catId: "PA-0005", catName: "Sonia", cageNo: "ICU-C01", temp: "100 F", treatment: "Treatment will go here", time: "8:00 am", givenBy: "Dr Sajdeen" },
  { catId: "PA-0006", catName: "Shah Sahab", cageNo: "GW-C05", temp: "100 F", treatment: "Treatment will go here", time: "10:00 pm", givenBy: "Dr Sajdeen" },
];

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState(treatmentsData);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const handleAddTreatment = (newTreatment: any) => {
    setTreatments([...treatments, newTreatment]);
  };

  const handleEditTreatment = (treatment: any) => {
    setSelectedTreatment(treatment);
    setShowEditDialog(true);
  };

  const handleEditSubmit = (updatedTreatment: any) => {
    setTreatments(treatments.map(t => (t === selectedTreatment ? updatedTreatment : t)));
  };

  const handleDeleteTreatment = (treatment: any) => {
    setSelectedTreatment(treatment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setTreatments(treatments.filter(t => t !== selectedTreatment));
    setSelectedTreatment(null);
  };

  const filteredTreatments = treatments.filter((treatment) => {
    if (catFilter && catFilter !== "all" && treatment.catId !== catFilter) return false;
    return true;
  });

  const handleResetFilter = () => {
    setDateFilter("");
    setCatFilter("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Treatments</h1>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add Treatment
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

            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cat ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cats</SelectItem>
                <SelectItem value="PA-0001">PA-0001</SelectItem>
                <SelectItem value="PA-0003">PA-0003</SelectItem>
                <SelectItem value="PA-0004">PA-0004</SelectItem>
                <SelectItem value="PA-0005">PA-0005</SelectItem>
                <SelectItem value="PA-0006">PA-0006</SelectItem>
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
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cage No.</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Temp</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Treatment</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Time</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Given By</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.map((treatment, index) => (
                <tr key={index} className="border-b border-border hover:bg-card/50">
                  <td className="py-4 px-4 text-foreground">{treatment.catId}</td>
                  <td className="py-4 px-4 text-foreground">{treatment.catName}</td>
                  <td className="py-4 px-4 text-foreground">{treatment.cageNo}</td>
                  <td className="py-4 px-4 text-foreground">{treatment.temp}</td>
                  <td className="py-4 px-4 text-foreground">{treatment.treatment}</td>
                  <td className="py-4 px-4 text-foreground">{treatment.time}</td>
                  <td className="py-4 px-4 text-foreground">{treatment.givenBy}</td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTreatment(treatment)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTreatment(treatment)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTreatmentDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddTreatment} />
      <EditTreatmentDialog open={showEditDialog} onOpenChange={setShowEditDialog} treatment={selectedTreatment} onEdit={handleEditSubmit} />
      <DeleteTreatmentDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} onConfirm={confirmDelete} />
    </DashboardLayout>
  );
}
