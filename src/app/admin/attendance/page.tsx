
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle2, AlertCircle, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
            <CardDescription className="text-white/80 font-bold uppercase text-[10px]">Active Classes</CardTitle>
            <CardTitle className="text-3xl font-bold">34</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">In session currently</span>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="border-b">
           <div className="flex justify-between items-center">
             <CardTitle className="text-lg">Departmental Overview</CardTitle>
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter department..." className="pl-10 bg-slate-50 border-none text-xs" />
             </div>
           </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {['Engineering', 'Management', 'Arts & Design', 'Applied Sciences'].map((dept) => (
            <div key={dept} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{dept}</h4>
                  <p className="text-[10px] text-muted-foreground">1,200 Total Students</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">92%</span>
                  <p className="text-[10px] text-muted-foreground tracking-tighter uppercase font-bold">Institutional Avg</p>
                </div>
              </div>
              <Progress value={92} className="h-2 bg-slate-100" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
