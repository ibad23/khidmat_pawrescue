"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import axios from "axios";
import { DashboardData, CatStatusDataPoint, TopReporter } from "@/lib/types";

const DashboardPage = () => {
  const [dateFilter, setDateFilter] = useState<string>("Till Date");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/dashboard/read', {
          params: { dateFilter }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [dateFilter]);

  // Format contact: insert a hyphen after the first 4 digits for display
  const formatContact = (c?: string | null) => {
    if (!c) return null;
    const digits = c.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length <= 4) return digits;
    return `${digits.slice(0,4)}-${digits.slice(4)}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {dateFilter}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => setDateFilter("Till Date")}>Till Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("Last Month")}>Last Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("Last 6 Months")}>Last 6 Months</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("Last Year")}>Last Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Skeleton for stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Skeleton for line chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>

            {/* Skeleton for bottom cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-80 w-full" />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">Total Cats Treated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardData.stats.totalCats.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">Recovered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardData.stats.recovered.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">Expired</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardData.stats.expired.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">Discharged</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardData.stats.discharged.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Donations Received Monthly</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                      <XAxis dataKey="month" className="stroke-muted-foreground" />
                      <YAxis className="stroke-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Cats Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.catStatusData}
                          cx="50%"
                          cy="50%"
                          // slightly larger pie and thicker slices for better visibility
                          innerRadius="30%"
                          outerRadius="85%"
                          paddingAngle={2}
                          dataKey="value"
                          // remove white borders between slices
                          stroke="none"
                          strokeWidth={0}
                        >
                          {dashboardData.catStatusData.map((entry: CatStatusDataPoint, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: '8px',
                            color: 'hsl(var(--card-foreground))'
                          }}
                        />
                        <Legend 
                          verticalAlign="middle" 
                          align="right"
                          layout="vertical"
                          iconType="circle"
                          iconSize={14}
                          wrapperStyle={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Top Owners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-sm text-muted-foreground font-normal py-2 text-left">Name</th>
                          <th className="text-sm text-muted-foreground font-normal py-2 text-left">Contact</th>
                          <th className="text-sm text-muted-foreground font-normal py-2 text-right">No of Cats</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.topReporters.map((reporter: TopReporter, index: number) => (
                          <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="text-foreground py-2 text-left">{reporter.name}</td>
                            <td className="text-foreground py-2 text-left">
                              {reporter.contact ? (
                                <a
                                  href={`tel:${(reporter.contact ?? "").replace(/\D/g, "")}`}
                                  className="text-foreground hover:underline"
                                >
                                  {formatContact(reporter.contact) ?? reporter.contact}
                                </a>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="text-foreground py-2 text-right">{reporter.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">Failed to load dashboard data</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
