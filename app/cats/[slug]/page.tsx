"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MoreVertical, ArrowLeft, Calendar, Home, User, Clock } from "lucide-react";
import { AddTreatmentDialog } from "@/components/dialogs/AddTreatmentDialog";
import { EditCatDialog } from "@/components/dialogs/EditCatDialog";
import { DeleteCatDialog } from "@/components/dialogs/DeleteCatDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCatId, formatCageNo, mapStatusToColor } from "@/lib/utils";
import { STATUS_COLORS, STATUS_DOT_COLORS, StatusColor } from "@/lib/types";
import { toast } from "sonner";

interface CatData {
  cat_id: number;
  cat_name: string;
  age: number | null;
  gender: string;
  type: string;
  cage_id: number | null;
  status: string;
  admitted_on: string | null;
  cage: { cage_id: number; cage_no: number } | null;
  externals: {
    external_id: number;
    name: string;
    contact_num: string;
    address: string;
  } | null;
}

interface CatForEdit {
  cat_id: number;
  cat_name: string;
  age: number | null;
  gender: string;
  type: string;
  cage_id: number | null;
  cage_no: number | null;
  status: string;
  owner_name: string;
  contact_num: string;
  address: string;
}

interface TreatmentData {
  id: number;
  date: string;
  temp: string;
  treatment: string;
  givenBy: string;
}

export default function CatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugRaw = params?.slug;
  const slugParam = Array.isArray(slugRaw) ? slugRaw[0] : (slugRaw ?? "");

  const [cat, setCat] = useState<CatData | null>(null);
  const [loadingCat, setLoadingCat] = useState(true);
  const [treatments, setTreatments] = useState<TreatmentData[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showAddTreatmentDialog, setShowAddTreatmentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract cat_id from slug (e.g., "PA-0001" -> 1)
  const catIdNum = (() => {
    const digitsMatch = String(slugParam).match(/\d+/);
    return digitsMatch ? Number(digitsMatch[0]) : undefined;
  })();

  const loadCat = useCallback(async () => {
    if (!catIdNum) return;
    try {
      setLoadingCat(true);
      const [catRes, statusRes] = await Promise.all([
        axios.get(`/api/cats/read?cat_id=${catIdNum}`),
        axios.get("/api/cats/statuses"),
      ]);
      setCat(catRes.data?.data || null);
      setStatusOptions(statusRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load cat:", err);
    } finally {
      setLoadingCat(false);
    }
  }, [catIdNum]);

  const loadTreatments = useCallback(async () => {
    if (!catIdNum) return;
    try {
      setLoadingTreatments(true);
      const res = await axios.get(`/api/treatments/read?cat_id=${catIdNum}`);
      const rows = res.data?.data || [];
      const mapped: TreatmentData[] = rows.map((r: any) => ({
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
      setLoadingTreatments(false);
    }
  }, [catIdNum]);

  useEffect(() => {
    loadCat();
    loadTreatments();
  }, [loadCat, loadTreatments]);

  const handleStatusChange = async (newStatus: string) => {
    if (!cat || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await axios.patch("/api/cats/update", {
        cat_id: cat.cat_id,
        status: newStatus,
      });
      toast.success("Status updated");
      setCat((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      console.error("Failed to update status", err);
      toast.error(err?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleEditSubmit = () => {
    loadCat();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!cat) return;
    setIsDeleting(true);
    try {
      await axios.delete("/api/cats/delete", {
        data: { cat_id: cat.cat_id },
      });
      toast.success("Cat deleted successfully");
      router.push("/cats");
    } catch (err: any) {
      console.error("Failed to delete cat", err);
      toast.error(err?.response?.data?.error || "Failed to delete cat");
    } finally {
      setIsDeleting(false);
    }
  };

  const catForEdit: CatForEdit | null = cat ? {
    cat_id: cat.cat_id,
    cat_name: cat.cat_name,
    age: cat.age,
    gender: cat.gender,
    type: cat.type,
    cage_id: cat.cage_id,
    cage_no: cat.cage?.cage_no || null,
    status: cat.status,
    owner_name: cat.externals?.name || "",
    contact_num: cat.externals?.contact_num || "",
    address: cat.externals?.address || "",
  } : null;

  const statusColor: StatusColor = mapStatusToColor(cat?.status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/cats")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Cats / Profile
            </button>
            <h1 className="text-3xl font-bold text-foreground">
              {loadingCat ? <Skeleton className="h-9 w-32" /> : slugParam}
            </h1>
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
              <div className="flex-1">
                {loadingCat ? (
                  <>
                    <Skeleton className="h-8 w-32 mb-4" />
                    <div className="flex items-center gap-3 flex-wrap">
                      <Skeleton className="h-9 w-36 rounded-lg" />
                      <Skeleton className="h-9 w-28 rounded-lg" />
                      <Skeleton className="h-9 w-24 rounded-lg" />
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-4">{cat?.cat_name || "Unknown"}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Admitted: </span>
                          <span className="text-foreground font-medium">
                            {cat?.admitted_on ? new Date(cat.admitted_on).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cage: </span>
                          <span className="text-foreground font-medium">
                            {cat?.cage?.cage_no ? formatCageNo(cat.cage.cage_no) : "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Gender: </span>
                          <span className="text-foreground font-medium">{cat?.gender || "-"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Age: </span>
                          <span className="text-foreground font-medium">{cat?.age !== null && cat?.age !== undefined ? `${cat.age} yr${cat.age !== 1 ? 's' : ''}` : "-"}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {loadingCat ? (
                  <Skeleton className="h-6 w-32 rounded-full" />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="inline-flex items-center focus:outline-none"
                        disabled={updatingStatus}
                      >
                        <Badge className={`${STATUS_COLORS[statusColor]} ${updatingStatus ? "opacity-50" : ""}`}>
                          {cat?.status || "Unknown"}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusOptions.map((s) => {
                        const itemColor = mapStatusToColor(s);
                        return (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={s === cat?.status ? "bg-accent" : ""}
                          >
                            <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[itemColor]} mr-2`} />
                            {s}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
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
                      {loadingTreatments ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                          </tr>
                        ))
                      ) : treatments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground">
                            No treatments recorded yet.
                          </td>
                        </tr>
                      ) : (
                        treatments.map((treatment) => (
                          <tr key={treatment.id} className="border-b border-border">
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
                    {loadingCat ? (
                      <>
                        <div>
                          <div className="text-muted-foreground">Name:</div>
                          <Skeleton className="h-5 w-24 mt-1" />
                        </div>
                        <div>
                          <div className="text-muted-foreground">Contact No:</div>
                          <Skeleton className="h-5 w-28 mt-1" />
                        </div>
                        <div>
                          <div className="text-muted-foreground">Address:</div>
                          <Skeleton className="h-5 w-full mt-1" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-muted-foreground">Name:</div>
                          <div className="text-foreground font-medium">{cat?.externals?.name || "-"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Contact No:</div>
                          <div className="text-foreground font-medium">{cat?.externals?.contact_num || "-"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Address:</div>
                          <div className="text-foreground font-medium">
                            {cat?.externals?.address || "-"}
                          </div>
                        </div>
                      </>
                    )}
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
        initialCatId={catIdNum ? String(catIdNum) : undefined}
        onAdd={() => loadTreatments()}
      />

      <EditCatDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        cat={catForEdit}
        onEdit={handleEditSubmit}
      />

      <DeleteCatDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        catName={cat?.cat_name || ""}
        catId={cat ? formatCatId(cat.cat_id) : ""}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}
