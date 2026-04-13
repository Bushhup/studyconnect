
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seed-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, GraduationCap, Building2, BookOpen, 
  TrendingUp, Clock, CheckCircle2,
  Database, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight,
  ArrowRight
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const collegeId = 'study-connect-college';

const performanceData = [
  { month: 'Jan', attendance: 92, performance: 78 },
  { month: 'Feb', attendance: 88, performance: 82 },
  { month: 'Mar', attendance: 95, performance: 85 },
  { month: 'Apr', attendance: 91, performance: 80 },
  { month: 'May', attendance: 94, performance: 88 },
  { month: 'Jun', attendance: 96, performance: 90 },
];

const chartConfig = {
  attendance: { label: 'Attendance %', color: 'hsl(var(--primary))' },
  performance: { label: 'Performance Avg', color: 'hsl(var(--chart-2))' },
};

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'colleges', collegeId, 'users', user.uid);
  }, [db, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'colleges', collegeId, 'users');
  }, [db, isAdmin]);

  const deptsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'colleges', collegeId, 'departments');
  }, [db, isAdmin]);
  
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: depts, isLoading: deptsLoading } = useCollection(deptsQuery);

  const studentCount = users?.filter(u => u.role === 'student').length || 0;
  const facultyCount = users?.filter(u => u.role === 'faculty').length || 0;
  const deptCount = depts?.length || 0;

  const stats = [
    { label: 'Academic Divisions', value: deptCount.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/departments' },
    { label: 'Total Faculty', value: facultyCount.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/users' },
    { label: 'Total Students', value: studentCount.toString(), icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/users' },
    { label: 'System Uptime', value: '99.9%', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/logs' },
  ];

  const handleSeedData = async () => {
    if (!db || !isAdmin) return;
    setIsSeeding(true);
    try {
      await seedDatabase(db);
      toast({ title: 'Database Initialized', description: 'Institutional hierarchy and sample records provisioned.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Initialization Failed', description: error.message });
    } finally {
      setIsSeeding(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-40 text-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Unauthorized Access</h2>
        <Button asChild><Link href="/profile">Return to Profile</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Institutional Oversight</h1>
          <p className="text-muted-foreground mt-1">Unified command for departments, performance, and infrastructure.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-card" onClick={handleSeedData} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Provision Hierarchy
          </Button>
          <Button className="font-bold shadow-lg shadow-primary/20">Generate Insights</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all group rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-xl transition-transform group-hover:rotate-6", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
              <Button asChild variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-tight text-primary mt-2 group-hover:translate-x-1 transition-transform">
                <Link href={stat.link}>Manage Module <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Institutional Growth</CardTitle>
              <CardDescription>Academic progression vs attendance rates across all divisions.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px]">Attendance</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-none font-bold uppercase text-[9px]">Grades</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-attendance)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-attendance)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={3} fill="url(#colorAttendance)" />
                <Area type="monotone" dataKey="performance" stroke="var(--color-performance)" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-headline font-bold">Top Performing Divisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {depts?.slice(0, 3).map((d, i) => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 group hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-card border flex items-center justify-center font-bold text-xs">#{i+1}</div>
                    <div>
                      <p className="text-sm font-bold">{d.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">H.O.D: {d.headOfDept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">92.4%</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Efficiency</p>
                  </div>
                </div>
              ))}
              <Button asChild variant="ghost" className="w-full font-bold uppercase text-[10px] tracking-widest text-primary hover:bg-primary/5">
                <Link href="/admin/departments">View All Departments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="font-bold text-lg font-headline">Departmental Load</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Academic resources are balanced across 4 divisions. Engineering currently holds the highest student enrollment at 42%.
            </p>
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-12">
              Optimize Resource Allocation
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
