'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Award, Target, BarChart3, 
  ArrowUpRight, Download, Calendar, Layers,
  ChevronRight, Star
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SEMESTER_GPA = [
  { name: 'Sem 1', gpa: 3.4, avg: 3.2 },
  { name: 'Sem 2', gpa: 3.6, avg: 3.3 },
  { name: 'Sem 3', gpa: 3.5, avg: 3.4 },
  { name: 'Sem 4', gpa: 3.8, avg: 3.5 },
];

const SUBJECT_DISTRIBUTION = [
  { name: 'Core Eng', value: 45, color: '#3B82F6' },
  { name: 'Math', value: 25, color: '#8B5CF6' },
  { name: 'Science', value: 20, color: '#10B981' },
  { name: 'Soft Skills', value: 10, color: '#F59E0B' },
];

export default function AcademicPerformance() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance Deep-Dive</h1>
          <p className="text-muted-foreground mt-1">Analytical insights into your academic journey and grade distributions.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-8">
          <Download className="h-4 w-4" /> Export Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Overall CGPA', value: '3.73', sub: '/ 4.0 Scale', icon: Award, color: 'bg-blue-50 text-blue-600' },
          { label: 'Class Percentile', value: 'Top 5%', sub: 'Rank #4 / 120', icon: Star, color: 'bg-purple-50 text-purple-600' },
          { label: 'Credit Success', value: '84', sub: 'Earned Units', icon: Target, color: 'bg-emerald-50 text-emerald-600' },
        ].map((item) => (
          <Card key={item.label} className="border-none shadow-sm bg-white rounded-[2rem] p-6 group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest">{item.label}</CardDescription>
              <div className={cn("p-2.5 rounded-2xl transition-transform group-hover:rotate-12", item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-slate-900">{item.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{item.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">GPA Growth Trend</CardTitle>
              <CardDescription>Comparative analysis vs Class Average</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-none">My GPA</Badge>
              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none">Class Avg</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEMESTER_GPA}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} domain={[3, 4]} />
                <Tooltip />
                <Area type="monotone" dataKey="gpa" stroke="#3B82F6" strokeWidth={3} fill="url(#colorGpa)" />
                <Area type="monotone" dataKey="avg" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-headline font-bold">Credit Weightage</CardTitle>
            <CardDescription>Major-wise mark distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SUBJECT_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {SUBJECT_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-6">
               {SUBJECT_DISTRIBUTION.map((item) => (
                 <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase truncate">{item.name}</span>
                    <span className="text-[10px] font-bold text-slate-900 ml-auto">{item.value}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-primary text-white rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
          <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
          <div className="space-y-2 relative z-10">
            <Badge className="bg-white/20 text-white border-none uppercase text-[9px] font-bold px-3">Milestone Achieved</Badge>
            <h3 className="text-2xl font-headline font-bold">Excellent Momentum</h3>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              You have maintained a GPA above 3.5 for four consecutive semesters. You are now eligible for the <strong>Dean's Merit Scholarship</strong> for the next academic year.
            </p>
          </div>
          <Button className="bg-white text-primary hover:bg-slate-100 font-bold rounded-xl h-12 px-8 relative z-10">
            View Scholarship Details
          </Button>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-headline font-bold">Strength Analysis</h3>
            <div className="space-y-4">
              {[
                { label: 'Analytical Reasoning', score: 92 },
                { label: 'Technical Writing', score: 85 },
                { label: 'System Architecture', score: 78 },
              ].map(skill => (
                <div key={skill.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">{skill.label}</span>
                    <span className="text-primary">{skill.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${skill.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" className="w-full text-xs font-bold text-primary uppercase mt-6 group">
            Request Skill Certification <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
