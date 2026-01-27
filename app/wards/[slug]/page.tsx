"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

const cagesData = [
  { id: "GW-C01", catId: "PA-0001", catName: "Sam", date: "14 Feb 2019", status: "occupied" },
  { id: "GW-C02", catId: "PA-0002", catName: "Sonia", date: "14 Feb 2019", status: "occupied" },
  { id: "GW-C03", catId: "PA-0003", catName: "Sam", date: "14 Feb 2019", status: "occupied" },
  { id: "GW-C04", catId: null, catName: null, date: null, status: "vacant" },
  { id: "GW-C05", catId: "PA-0005", catName: "Sonia", date: "14 Feb 2019", status: "occupied" },
  { id: "GW-C06", catId: null, catName: null, date: null, status: "vacant" },
];

export default function WardDetailPage() {
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Wards / General</div>
            <h1 className="text-3xl font-bold text-foreground">General Ward</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Edit Ward Details</Button>
        </div>

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Filter className="w-5 h-5" />
            </Button>

            <div className="relative">
              <Button variant="outline" className="gap-2" onClick={() => setShowStatusFilter(!showStatusFilter)}>
                Filter By
              </Button>
            </div>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="14 Feb 2019" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-4 space-y-3">
                    <div className="font-semibold mb-3">Select Status</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="occupied" />
                        <label htmlFor="occupied" className="text-sm">Occupied</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="vacant" />
                        <label htmlFor="vacant" className="text-sm">Vacant</label>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-primary">Apply</Button>
                    <p className="text-xs text-muted-foreground text-center">*You can choose multiple Order type</p>
                  </div>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="gap-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground transition-colors">
              <RotateCcw className="w-4 h-4" />
              Reset Filter
            </Button>
          </div>
        </Card>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cage ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat ID</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Cat Name</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {cagesData.map((cage) => (
                <tr key={cage.id} className="border-b border-border hover:bg-card/50">
                  <td className="py-4 px-4 text-foreground">{cage.id}</td>
                  <td className="py-4 px-4 text-foreground">{cage.catId || "-"}</td>
                  <td className="py-4 px-4 text-foreground">{cage.catName || "-"}</td>
                  <td className="py-4 px-4 text-foreground">{cage.date || "-"}</td>
                  <td className="py-4 px-4">
                    {cage.status === "occupied" ? (
                      <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">Occupied</Badge>
                    ) : (
                      <Badge className="bg-status-success/20 text-status-success hover:bg-status-success/30">Vacant</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {cage.status === "vacant" && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
