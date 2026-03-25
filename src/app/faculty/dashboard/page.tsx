'use client';

import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useMemoFirebase 
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, ClipboardCheck, FileSpreadsheet, 
  TrendingUp, Clock, BookOpen, ChevronRight,
  Plus, ArrowUpRight, Award, MessageSquare, Megaphone,
  CheckCircle2, AlertCircle, FileText, Loader2
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

const collegeId = 'study-connect-college';

export default function FacultyDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(userDocRef);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authenticating faculty access...</p>
      </div>
    );
  }

  const facultyName = profile ? `Dr. ${profile.firstName} ${profile.lastName}` : 'Dr. Sarah Smith';
  const facultyInitials = facultyName.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Welcome, {facultyName}</h1>
          <p className="text-muted-foreground mt-1">
            {profile?.departmentId || 'Department of Engineering & Technology'} • Academic Year 2024-25
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2 border-slate-200 shadow-sm bg-white">
            <MessageSquare className="h-4 w-4" /> Department Chat
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" /> Quick Action
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Classes', value: '4', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Students', value: '184', icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Subjects Handled', value: '3', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Attendance Avg', value: '94.2%', icon: ClipboardCheck, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white">
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
                <span>+2.1% from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Performance Analytics</CardTitle>
              <CardDescription>Academic progression across all assigned sections</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge variant="outline" className="bg-primary/5 text-primary border-none">Avg Marks</Badge>
               <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none">Attendance</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-marks)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-marks)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
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

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold">Today's Schedule</CardTitle>
              <CardDescription>Upcoming assigned sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.map((item) => (
                <div key={item.id} className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/20 hover:before:bg-primary transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest">{item.time}</p>
                      <p className="text-sm font-bold text-slate-800">{item.subject}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                        <Clock className="h-3 w-3" /> {item.room} • {item.type}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full mt-4 font-bold text-xs rounded-xl h-11 border-dashed">
                <Link href="/faculty/calendar">View Full Calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl overflow-hidden relative">
            <Megaphone className="absolute right-[-10px] top-[-10px] h-20 w-20 text-white/5 -rotate-12" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-bold">Final Exam Schedule Out</p>
                <p className="text-[10px] text-white/50">Please review the syllabus update for Sem 5.</p>
              </div>
              <Button variant="link" className="text-white p-0 h-auto text-xs font-bold" asChild>
                <Link href="/faculty/announcements">View all updates →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-headline font-bold">Quick Management</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-none shadow-none">
              <Link href="/faculty/attendance">
                <ClipboardCheck className="h-6 w-6" />
                <span className="text-xs font-bold">Mark Attendance</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 border-none shadow-none">
              <Link href="/faculty/resources">
                <FileText className="h-6 w-6" />
                <span className="text-xs font-bold">Upload Notes</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
              <Link href="/faculty/marks">
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-xs font-bold">Enter Marks</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">System Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Attendance Pending</p>
                <p className="text-[10px] text-amber-700">Section A - Advanced Algorithms (Oct 24)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Grades Synced</p>
                <p className="text-[10px] text-emerald-700">CAT-1 marks for ML have been published.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
