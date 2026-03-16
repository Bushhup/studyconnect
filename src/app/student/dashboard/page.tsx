'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, ClipboardCheck, Award, Briefcase, 
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  FileText, Calendar, MessageSquare, ArrowUpRight,
  ChevronRight, Download, Bell, Megaphone, FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const performanceData = [
  { month: 'Sem 1', gpa: 3.4 },
  { month: 'Sem 2', gpa: 3.6 },
  { month: 'Sem 3', gpa: 3.5 },
  { month: 'Sem 4', gpa: 3.8 },
];

const schedule = [
  { id: 1, time: '09:00 AM', subject: 'Machine Learning', room: 'Lab 302', faculty: 'Dr. Sarah Smith' },
  { id: 2, time: '11:15 AM', subject: 'Advanced Algorithms', room: 'Hall B', faculty: 'Prof. James Wilson' },
  { id: 3, time: '02:00 PM', subject: 'Data Science Lab', room: 'Lab 1', faculty: 'Dr. Sarah Smith' },
];

const chartConfig = {
  gpa: { label: 'Semester GPA', color: 'hsl(var(--primary))' },
};

export default function StudentDashboard() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg ring-1 ring-slate-100">
            <AvatarImage src="https://i.pravatar.cc/150?u=student" />
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">AJ</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Welcome, Alex Johnson</h1>
            <p className="text-muted-foreground mt-1">B.Tech Computer Science • Semester 5 • UG Program</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2 border-slate-200" asChild>
            <Link href="/student/notifications">
              <Bell className="h-4 w-4" /> Notifications
            </Link>
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/20 gap-2" asChild>
            <Link href="/student/assignments">
              <Briefcase className="h-4 w-4" /> My Tasks
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Attendance Rate', value: '94.2%', icon: ClipboardCheck, color: 'bg-blue-50 text-blue-600', progress: 94 },
          { label: 'Current CGPA', value: '3.73', icon: Award, color: 'bg-purple-50 text-purple-600', progress: 85 },
          { label: 'Enrolled Courses', value: '6', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600', progress: 100 },
          { label: 'Pending Tasks', value: '3', icon: Briefcase, color: 'bg-amber-50 text-amber-600', progress: 40 },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-xl transition-transform group-hover:rotate-6", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
              <Progress value={stat.progress} className="h-1 mt-4 bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Academic Progression</CardTitle>
              <CardDescription>Semester-wise GPA Performance</CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-none">CGPA: 3.73</Badge>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-gpa)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-gpa)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide domain={[0, 4]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="var(--color-gpa)" 
                  strokeWidth={3} 
                  fill="url(#colorGpa)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold">Today's Schedule</CardTitle>
              <CardDescription>Upcoming classes and labs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.map((item) => (
                <div key={item.id} className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/20 hover:before:bg-primary transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest">{item.time}</p>
                      <p className="text-sm font-bold text-slate-800">{item.subject}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                        <Clock className="h-3 w-3" /> {item.room} • {item.faculty}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full mt-4 font-bold text-xs rounded-xl h-11 border-dashed">
                <Link href="/student/calendar">View Full Calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl overflow-hidden relative">
            <Megaphone className="absolute right-[-10px] top-[-10px] h-20 w-20 text-white/5 -rotate-12" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Campus Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-bold">Rescheduled: ML Practical</p>
                <p className="text-[10px] text-white/50">Tuesday session moved to Lab 1.</p>
              </div>
              <Button variant="link" className="text-white p-0 h-auto text-xs font-bold" asChild>
                <Link href="/student/announcements">View all broadcasts →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-none shadow-none">
              <Link href="/student/attendance">
                <ClipboardCheck className="h-6 w-6" />
                <span className="text-xs font-bold">Check Presence</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 border-none shadow-none">
              <Link href="/student/resources">
                <FileText className="h-6 w-6" />
                <span className="text-xs font-bold">Download Notes</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
              <Link href="/student/marks">
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-xs font-bold">View Grades</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Submission Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Assignment Pending</p>
                <p className="text-[10px] text-amber-700">Neural Networks Implementation • Due in 2 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Model Exam Result</p>
                <p className="text-[10px] text-emerald-700">Applied Physics grades have been published.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
