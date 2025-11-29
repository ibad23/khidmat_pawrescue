"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";

const monthlyData = [
  { month: 'Jan', value: 5000 },
  { month: 'Feb', value: 8000 },
  { month: 'Mar', value: 12000 },
  { month: 'Apr', value: 7000 },
  { month: 'May', value: 22000 },
  { month: 'Jun', value: 13000 },
  { month: 'Jul', value: 15000 },
  { month: 'Aug', value: 18000 },
  { month: 'Sep', value: 16000 },
  { month: 'Oct', value: 14000 },
  { month: 'Nov', value: 13000 },
  { month: 'Dec', value: 15000 },
];

const catStatusData = [
  { name: 'Under Observation', value: 250, color: '#ef4444' },
  { name: 'Under Treatment', value: 380, color: '#3b82f6' },
  { name: 'Recovered', value: 520, color: '#f59e0b' },
  { name: 'Expired', value: 89, color: '#dc2626' },
  { name: 'Move to HA', value: 156, color: '#06b6d4' },
  { name: 'Fostered', value: 234, color: '#a855f7' },
  { name: 'Adopted', value: 456, color: '#14b8a6' },
  { name: 'Discharged', value: 178, color: '#10b981' },
];

const topReporters = [
  { name: 'Sohaib', count: 13 },
  { name: 'Dr Haniya', count: 8 },
  { name: 'Noman', count: 5 },
  { name: 'Ali', count: 4 },
  { name: 'Ahmad', count: 3 },
];

const DashboardPage = () => {
  const [dateFilter, setDateFilter] = useState<string>("Till Date");

  const filteredData = useMemo(() => {
    let monthsToShow = 12;
    if (dateFilter === "Last Month") monthsToShow = 1;
    else if (dateFilter === "Last 6 Months") monthsToShow = 6;
    else if (dateFilter === "Last Year") monthsToShow = 12;
    return monthlyData.slice(-monthsToShow);
  }, [dateFilter]);

  const filteredStats = useMemo(() => {
    const multiplier = dateFilter === "Last Month" ? 0.083 :
                       dateFilter === "Last 6 Months" ? 0.5 :
                       dateFilter === "Last Year" ? 1 : 1;

    return {
      totalCats: Math.round(40689 * multiplier),
      recovered: Math.round(10293 * multiplier),
      expired: Math.round(89000 * multiplier),
      discharged: Math.round(2040 * multiplier),
    };
  }, [dateFilter]);

  const filteredCatStatus = useMemo(() => {
    const multiplier = dateFilter === "Last Month" ? 0.083 :
                       dateFilter === "Last 6 Months" ? 0.5 :
                       dateFilter === "Last Year" ? 1 : 1;

    return catStatusData.map(item => ({
      ...item,
      value: Math.round(item.value * multiplier)
    }));
  }, [dateFilter]);

  const filteredReporters = useMemo(() => {
    const multiplier = dateFilter === "Last Month" ? 0.3 :
                       dateFilter === "Last 6 Months" ? 0.6 :
                       dateFilter === "Last Year" ? 0.9 : 1;

    return topReporters.map(r => ({
      ...r,
      count: Math.max(1, Math.round(r.count * multiplier))
    }));
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
              <DropdownMenuItem onClick={() => setDateFilter("Till Date")}>Reset Filter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Total Cats Treated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filteredStats.totalCats.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Recovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filteredStats.recovered.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filteredStats.expired.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Discharged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filteredStats.discharged.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Donations Receive Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
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
                      data={filteredCatStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {filteredCatStatus.map((entry, index) => (
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
              <CardTitle className="text-foreground">Top 5 Reporter/Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pb-2 border-b border-border">
                  <div>Name</div>
                  <div>No of Cats</div>
                </div>
                {filteredReporters.map((reporter, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 text-foreground">
                    <div>{reporter.name}</div>
                    <div>{reporter.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
