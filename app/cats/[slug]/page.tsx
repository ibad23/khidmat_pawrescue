"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MoreVertical } from "lucide-react";
import { AddTreatmentDialog } from "@/components/dialogs/AddTreatmentDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const treatmentsData = [
  { date: "14 Feb 2019 10:00 am", temp: "101", treatment: "Treatment details will go here", givenBy: "Dr Sajdeen" },
  { date: "14 Feb 2019 10:00 pm", temp: "98", treatment: "Treatment details will go here", givenBy: "Dr Amanullah" },
  { date: "14 Feb 2019 10:00 am", temp: "100", treatment: "Treatment details will go here", givenBy: "Dr Sajdeen" },
];

export default function CatDetailPage() {
  const [showAddTreatmentDialog, setShowAddTreatmentDialog] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Cats / Profile</div>
            <h1 className="text-3xl font-bold text-foreground">PA-0001</h1>
          </div>
          <Button
            onClick={() => setShowAddTreatmentDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            +Add Treatment
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Sonia</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Admitted On: 14 Feb, 2019</span>
                  <span>Cage No.: GW-C01</span>
                  <span>Gender: Female</span>
                  <span>Age: 1</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-status-info/20 text-status-info">
                  Under Treatment
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date/Time</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Temp</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Treatment</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Given By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {treatmentsData.map((treatment, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-3 px-4 text-foreground text-sm">{treatment.date}</td>
                          <td className="py-3 px-4 text-foreground text-sm">{treatment.temp}</td>
                          <td className="py-3 px-4 text-foreground text-sm">{treatment.treatment}</td>
                          <td className="py-3 px-4 text-foreground text-sm">{treatment.givenBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <Card className="bg-secondary border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground text-lg">Owner / Reporter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Name:</div>
                      <div className="text-foreground font-medium">Sohaib</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Contact No:</div>
                      <div className="text-foreground font-medium">0231845023</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Address:</div>
                      <div className="text-foreground font-medium">
                        XYZ flat no. 12, Imaginary street Karachi, Pakistan
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type:</div>
                      <div className="text-foreground font-medium">Pet</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddTreatmentDialog open={showAddTreatmentDialog} onOpenChange={setShowAddTreatmentDialog} />
    </DashboardLayout>
  );
}
