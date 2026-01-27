import client from "@/app/api/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dateFilter = url.searchParams.get("dateFilter") || "Till Date";

    // Calculate date range
    let startDate: Date | null = null;
    const endDate = new Date();

    if (dateFilter === "Last Month") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (dateFilter === "Last 6 Months") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (dateFilter === "Last Year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Get total cats and status breakdown
    let catsQuery = client
      .from("cats")
      .select("cat_id, status", { count: "exact" });

    if (startDate) {
      catsQuery = catsQuery.gte("admitted_on", startDate.toISOString().split("T")[0]);
    }

    const { data: catsData, count: totalCatsCount } = await catsQuery;
    const totalCats = totalCatsCount || 0;

    // Count cats by status
    const statusCounts: Record<string, number> = {};
    catsData?.forEach((cat: any) => {
      statusCounts[cat.status] = (statusCounts[cat.status] || 0) + 1;
    });

    const catStatusData = [
      { name: "Under Observation", value: statusCounts["Under observation"] || 0, color: "#ef4444" },
      { name: "Under Treatment", value: statusCounts["Under Treatment"] || 0, color: "#3b82f6" },
      { name: "Recovered", value: statusCounts["Ready to discharge"] || 0, color: "#f59e0b" },
      { name: "Expired", value: statusCounts["Expired"] || 0, color: "#dc2626" },
      { name: "Move to HA", value: (statusCounts["Move to healthy area"] || 0) + (statusCounts["Ready to move H.A"] || 0), color: "#06b6d4" },
      { name: "Fostered", value: statusCounts["Fostered"] || 0, color: "#a855f7" },
      { name: "Adopted", value: statusCounts["Adopted"] || 0, color: "#14b8a6" },
      { name: "Discharged", value: statusCounts["Discharged"] || 0, color: "#10b981" },
      { name: "Healthy in LP", value: statusCounts["Healthy in lower portion"] || 0, color: "#6366f1" },
      { name: "Missing", value: statusCounts["Missing"] || 0, color: "#78716c" },
    ].filter(item => item.value > 0);

    // Get donations data by month
    let donationsQuery = client
      .from("donations")
      .select("date, amount");

    if (startDate) {
      donationsQuery = donationsQuery.gte("date", startDate.toISOString().split("T")[0]);
    }

    const { data: donationsData } = await donationsQuery;

    const monthlyDonations: Record<string, number> = {};
    donationsData?.forEach((d: any) => {
      if (d.date && d.amount) {
        const month = new Date(d.date).toLocaleString("default", { month: "short" });
        monthlyDonations[month] = (monthlyDonations[month] || 0) + d.amount;
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((month) => ({
      month,
      value: monthlyDonations[month] || 0,
    }));

    // Get top owners/reporters
    let ownersQuery = client
      .from("cats")
      .select("external_id, externals(name, contact_num)")
      .not("external_id", "is", null);

    if (startDate) {
      ownersQuery = ownersQuery.gte("admitted_on", startDate.toISOString().split("T")[0]);
    }

    const { data: ownersData } = await ownersQuery;

    const ownerCounts: Record<string, number> = {};
    const ownerContacts: Record<string, string | null> = {};
    ownersData?.forEach((cat: any) => {
      if (cat.externals) {
        const name = cat.externals?.name || "Unknown";
        const contact = cat.externals?.contact_num ?? null;
        ownerCounts[name] = (ownerCounts[name] || 0) + 1;
        // keep first-seen contact for that name
        if (!ownerContacts[name]) ownerContacts[name] = contact;
      }
    });

    const topReporters = Object.entries(ownerCounts)
      .map(([name, count]) => ({ name, count, contact: ownerContacts[name] ?? null }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Summary stats
    const recovered = statusCounts["Ready to discharge"] || 0;
    const expired = statusCounts["Expired"] || 0;
    const discharged = statusCounts["Discharged"] || 0;

    return NextResponse.json(
      {
        stats: {
          totalCats,
          recovered,
          expired,
          discharged,
        },
        monthlyData,
        catStatusData,
        topReporters,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Dashboard error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
