'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, ClipboardCheck, FileSpreadsheet, 
  TrendingUp, Clock, BookOpen, ChevronRight,
  Plus, ArrowUpRight, Award, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const performanceData = [
  { month: 'Aug', marks: 72, attendance: 88 },
  { month: 'Sep', marks: 78, attendance: 92 },
  { month: 'Oct', marks: 85, attendance: 90 },
  { month: 'Nov', marks: 82, attendance: 94 },
  { month: 'Dec', marks: 88, attendance: 96 },
];

const schedule = [
  { id: 1, time: '09:00 AM', subject: 'Machine Learning', room: 'Lab 302', type: 'Lecture' },
  { id: 2, time: '11:15 AM', subject: 'Advanced Algorithms', room: 'Hall B', type: 'Tutorial' },
  { id: 3, time: '02:00 PM', subject: 'Data Science Lab', room: 'Computer Lab 1', type: 'Practical' },
];

const chartConfig = {
  marks: { label: 'Class Avg Marks', color: 'hsl(var(--primary))' },
  attendance: { label: 'Attendance %', color: 'hsl(var(--accent))' },
};

export default function FacultyDashboard() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned classes and monitor student progression.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2">
            <MessageSquare className="h-4 w-4" /> Message Dept
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" /> New Material
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: '184', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Classes Today', value: '3', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
          { label: 'Attendance Avg', value: '94.2%', icon: ClipboardCheck, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Grades', value: '12', icon: FileSpreadsheet, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-xl", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
              <div className="flex items-center mt-2 text-[10px] font-bold text-emerald-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+2.1% from last sem</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Class Progression</CardTitle>
              <CardDescription>Academic Year 2024-25 • Semester 5</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge variant="outline" className="bg-primary/5 text-primary border-none">Avg Marks</Badge>
               <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none">Presence</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-marks)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-marks)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="marks" 
                  stroke="var(--color-marks)" 
                  strokeWidth={3} 
                  fill="url(#colorMarks)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="var(--color-attendance)" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  fill="transparent" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Daily Schedule</CardTitle>
            <CardDescription>Today's assigned sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/20 hover:before:bg-primary transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest">{item.time}</p>
                    <p className="text-sm font-bold text-slate-800">{item.subject}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {item.room} • {item.type}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4 font-bold text-xs rounded-xl h-11 border-dashed">
              View Monthly Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm bg-slate-900 text-white overflow-hidden relative rounded-[2rem]">
          <Award className="absolute right-[-20px] top-[-20px] h-40 w-40 text-white/5 -rotate-12" />
          <CardHeader>
            <CardTitle className="text-lg">Student Spotlight</CardTitle>
            <CardDescription className="text-white/60">Top performer this week</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4 relative z-10">
            <Avatar className="h-20 w-20 border-4 border-white/10 ring-2 ring-primary">
              <AvatarImage src="https://i.pravatar.cc/150?u=12" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold">James Daniel</p>
              <p className="text-xs text-white/60">UG • CSE • Semester 5</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full pt-4">
               <div className="bg-white/10 p-3 rounded-2xl">
                 <p className="text-[10px] font-bold text-white/40 uppercase">GPA</p>
                 <p className="text-lg font-bold">3.94</p>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl">
                 <p className="text-[10px] font-bold text-white/40 uppercase">Rank</p>
                 <p className="text-lg font-bold">#1</p>
               </div>
            </div>
            <Button className="w-full bg-white text-slate-900 hover:bg-white/90 font-bold">View Profile</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Pending Assessments</CardTitle>
            <CardDescription>Results required for institutional portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { subject: 'Machine Learning', count: 42, progress: 85, deadline: '2 days left' },
              { subject: 'Data Science Lab', count: 18, progress: 40, deadline: '5 days left' },
              { subject: 'Advanced Algorithms', count: 42, progress: 0, deadline: '8 days left' },
            ].map((task) => (
              <div key={task.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{task.subject}</span>
                    <Badge variant="secondary" className="text-[9px] font-bold bg-slate-100">{task.count} Students</Badge>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">{task.deadline}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={task.progress} className="h-2 flex-1" />
                  <span className="text-xs font-bold text-muted-foreground w-8">{task.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
