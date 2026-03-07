'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Week 1', apps: 400, enroll: 240 },
  { name: 'Week 2', apps: 300, enroll: 139 },
  { name: 'Week 3', apps: 200, enroll: 980 },
  { name: 'Week 4', apps: 278, enroll: 390 },
  { name: 'Week 5', apps: 189, enroll: 480 },
  { name: 'Week 6', apps: 239, enroll: 380 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into enrollment trends and academic performance.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> Last 30 Days</Button>
           <Button className="gap-2 shadow-lg shadow-primary/20"><Download className="h-4 w-4" /> Download Full PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
             <div className="flex justify-between items-center">
               <div>
                 <CardTitle className="text-lg">Enrollment Growth</CardTitle>
                 <CardDescription>Application vs Admission Trends</CardDescription>
               </div>
               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">+14% Growth</Badge>
             </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="apps" stroke="#3B82F6" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <TrendingUp className="h-5 w-5" /> Quick Insights
             </CardTitle>
             <CardDescription className="text-white/70">AI-generated summary based on recent data.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6 pt-2">
              <div className="p-4 rounded-xl bg-white/10 space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Placement Rate</span>
                    <ArrowUpRight className="h-4 w-4" />
                 </div>
                 <div className="text-2xl font-bold">92.4%</div>
                 <p className="text-[10px] text-white/60">Highest in the last 5 years, driven by Engineering department.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Student Retention</span>
                    <BarChart3 className="h-4 w-4" />
                 </div>
                 <div className="text-2xl font-bold">98.1%</div>
                 <p className="text-[10px] text-white/60">Excellent campus engagement scores reported this semester.</p>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold">Generate Custom Report</Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", className)}>
      {children}
    </span>
  );
}
