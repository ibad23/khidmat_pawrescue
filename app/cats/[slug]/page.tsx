"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";

const treatmentsData = [
  { date: "14 Feb 2019 10:00 am", temp: "101", treatment: "Treatment details will go here", givenBy: "Dr Sajdeen" },
  { date: "14 Feb 2019 10:00 pm", temp: "98", treatment: "Treatment details will go here", givenBy: "Dr Amanullah" },
  { date: "14 Feb 2019 10:00 am", temp: "100", treatment: "Treatment details will go here", givenBy: "Dr Sajdeen" },
];

export default function CatDetailPage() {
  const params = useParams();
  const slugRaw = params?.slug;
  const slugParam = Array.isArray(slugRaw) ? slugRaw[0] : (slugRaw ?? "");
  const [showAddTreatmentDialog, setShowAddTreatmentDialog] = useState(false);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTreatments = useCallback(async () => {
    if (!slugParam) return;
    try {
      setLoading(true);
      // Turn slug like 'PA-0001' into digits (e.g., 1)
      const digitsMatch = String(slugParam).match(/\d+/);
      const catIdNum = digitsMatch ? Number(digitsMatch[0]) : undefined;
      if (!catIdNum) return;
      const res = await axios.get(`/api/treatments/read?cat_id=${catIdNum}`);
      const rows = res.data?.data || [];
      const mapped = rows.map((r: any) => ({
        id: r.treatment_id,
        date: r.date_time ? new Date(r.date_time).toLocaleString() : "",
        temp: r.temperature || "",
        treatment: r.treatment || "",
        givenBy: r.users?.user_name || (r.user_id ? `User ${r.user_id}` : ""),
      }));
      setTreatments(mapped);
    } catch (err) {
      console.error("Failed to load treatments for cat:", err);
    } finally {
      setLoading(false);
    }
  }, [slugParam]);

  useEffect(() => {
    loadTreatments();
  }, [loadTreatments]);

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
            + Add Treatment
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
                      {loading ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                          </tr>
                        ))
                      ) : (
                        treatments.map((treatment, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-3 px-4 text-foreground text-sm">{treatment.date}</td>
                            <td className="py-3 px-4 text-foreground text-sm">{treatment.temp}</td>
                            <td className="py-3 px-4 text-foreground text-sm">{treatment.treatment}</td>
                            <td className="py-3 px-4 text-foreground text-sm">{treatment.givenBy}</td>
                          </tr>
                        ))
                      )}
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

      <AddTreatmentDialog
        open={showAddTreatmentDialog}
        onOpenChange={setShowAddTreatmentDialog}
        // convert slugParam 'PA-0001' to numeric '1' if present
        initialCatId={(() => {
          const digits = String(slugParam).match(/\d+/);
          return digits ? digits[0] : undefined;
        })()}
        onAdd={() => loadTreatments()}
      />
    </DashboardLayout>
  );
}
