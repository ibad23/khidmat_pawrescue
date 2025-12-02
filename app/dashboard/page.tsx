"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const DashboardPage = () => {
  const [dateFilter, setDateFilter] = useState<string>("Till Date");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/read?dateFilter=${dateFilter}`);
        const json = await res.json();
        if (res.ok) {
          setDashboardData(json);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [dateFilter]);

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
          <div className="text-center text-muted-foreground">Loading dashboard...</div>
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
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.catStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {dashboardData.catStatusData.map((entry: any, index: number) => (
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
                          wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Top 5 Reporters/Owners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-sm text-muted-foreground font-normal py-2 text-center">Name</th>
                          <th className="text-sm text-muted-foreground font-normal py-2 text-center">No of Cats</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.topReporters.map((reporter: any, index: number) => (
                          <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="text-foreground py-2 text-center">{reporter.name}</td>
                            <td className="text-foreground py-2 text-center">{reporter.count}</td>
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
