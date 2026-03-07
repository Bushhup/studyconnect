'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle2, AlertCircle, Search, Download, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  XAxis, YAxis, CartesianGrid, 
  AreaChart, Area
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const attendanceTrendData = [
  { day: 'Mon', engineering: 92, management: 88, arts: 85, science: 94 },
  { day: 'Tue', engineering: 95, management: 90, arts: 87, science: 96 },
  { day: 'Wed', engineering: 94, management: 89, arts: 84, science: 95 },
  { day: 'Thu', engineering: 91, management: 86, arts: 82, science: 92 },
  { day: 'Fri', engineering: 89, management: 85, arts: 80, science: 90 },
  { day: 'Sat', engineering: 85, management: 80, arts: 75, science: 88 },
  { day: 'Sun', engineering: 0, management: 0, arts: 0, science: 0 },
];

const chartConfig = {
  engineering: {
    label: "Engineering",
    color: "hsl(var(--chart-1))",
  },
  management: {
    label: "Management",
    color: "hsl(var(--chart-2))",
  },
  arts: {
    label: "Arts & Design",
    color: "hsl(var(--chart-3))",
  },
  science: {
    label: "Applied Sciences",
    color: "hsl(var(--chart-4))",
  },
};

export default function AttendancePage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor institutional attendance trends and identify at-risk students.</p>
        </div>
        <Button variant="outline" className="gap-2 shadow-sm">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-emerald-500 text-white pb-6">
            <CardDescription className="text-white/80 font-bold uppercase text-[10px]">Today's Status</CardDescription>
            <CardTitle className="text-3xl font-bold">94.2%</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">4,520 Present Today</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-amber-500 text-white pb-6">
            <CardDescription className="text-white/80 font-bold uppercase text-[10px]">Low Attendance Alerts</CardDescription>
            <CardTitle className="text-3xl font-bold">128</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Under 75% threshold</span>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-blue-500 text-white pb-6">
            <CardDescription className="text-white/80 font-bold uppercase text-[10px]">Active Classes</CardDescription>
            <CardTitle className="text-3xl font-bold">34</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">In session currently</span>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-headline text-slate-900">Departmental Comparison</CardTitle>
                <CardDescription>Comparative daily attendance rates across core departments.</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                <TrendingUp className="h-3 w-3" /> +2.4% Overall
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={attendanceTrendData} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="fillEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-engineering)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-engineering)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fillMgmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-management)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-management)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fillArts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-arts)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-arts)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fillSci" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-science)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-science)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="engineering" 
                  stroke="var(--color-engineering)" 
                  strokeWidth={2} 
                  fill="url(#fillEng)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="management" 
                  stroke="var(--color-management)" 
                  strokeWidth={2} 
                  fill="url(#fillMgmt)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="arts" 
                  stroke="var(--color-arts)" 
                  strokeWidth={2} 
                  fill="url(#fillArts)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="science" 
                  stroke="var(--color-science)" 
                  strokeWidth={2} 
                  fill="url(#fillSci)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Department Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {Object.entries(chartConfig).map(([key, config]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    <h4 className="font-bold text-slate-800 text-sm">{config.label}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">92%</span>
                  </div>
                </div>
                <Progress value={92} className="h-2 bg-slate-100" />
              </div>
            ))}
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter department..." className="pl-10 bg-slate-50 border-none text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}