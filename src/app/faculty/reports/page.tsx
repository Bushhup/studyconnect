'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, Download, Calendar, 
  ArrowUpRight, Users, Award, AlertCircle,
  BookOpen, PieChart, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const classPerformance = [
  { name: 'ML Sec A', avg: 84, attendance: 92 },
  { name: 'ML Sec B', avg: 78, attendance: 88 },
  { name: 'DS Lab', avg: 88, attendance: 95 },
  { name: 'Algo Tut', avg: 72, attendance: 85 },
];

const subjectPerformance = [
  { name: 'CAT-1', score: 72 },
  { name: 'CAT-2', score: 78 },
  { name: 'Model', score: 85 },
  { name: 'Final', score: 88 },
];

export default function ReportsPerformance() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep-dive into academic results and attendance trends.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full gap-2 border-slate-200">
             <Calendar className="h-4 w-4" /> Current Semester
           </Button>
           <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-6">
             <Download className="h-4 w-4" /> Generate Full Report
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Class-wise Comparison</CardTitle>
              <CardDescription>Performance vs Attendance across assigned sections</CardDescription>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">Update: Live</Badge>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="avg" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} name="Avg Marks" />
                <Bar dataKey="attendance" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-white rounded-2xl p-6 relative overflow-hidden">
            <TrendingUp className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Award className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Highest Performer</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Sarah Miller</p>
                <p className="text-xs text-white/60">Machine Learning • Sem 5 • 98.4%</p>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl mt-2">
                Full Rank List
              </Button>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Class Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-red-900 uppercase">Critical Review</p>
                  <p className="text-[11px] text-red-700 leading-tight">12 students in ML Sec B are below the 75% attendance threshold.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-blue-900 uppercase">Growth Trend</p>
                  <p className="text-[11px] text-blue-700 leading-tight">Avg class scores for Model Exams improved by 14% vs CAT-1.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Subject-wise Progression</CardTitle>
            <CardDescription>Evaluation phase performance trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subjectPerformance}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg">Top Potential Risks</h3>
              <Badge variant="outline" className="border-red-100 text-red-600">Low Attendance</Badge>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Emily Davis', attendance: '68%', target: '75%' },
                { name: 'James Wilson', attendance: '72%', target: '75%' },
                { name: 'Alex Johnson', attendance: '74%', target: '75%' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Sem 5 • Eng</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-600">{item.attendance}</p>
                    <p className="text-[10px] text-muted-foreground">Threshold: {item.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" className="w-full mt-4 font-bold text-xs text-primary uppercase">View all risk-alerts</Button>
        </Card>
      </div>
    </div>
  );
}