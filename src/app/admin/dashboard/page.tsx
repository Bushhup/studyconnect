
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seed-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, GraduationCap, Building2, BookOpen, 
  TrendingUp, Clock, CheckCircle2,
  Database, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight,
  ArrowRight, PieChart as PieChartIcon
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

const enrollmentColors = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
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
  const isHOD = profile?.role === 'hod';
  const hasAccess = isAdmin || isHOD;

  // Department-restricted queries
  const usersQuery = useMemoFirebase(() => {
    if (!db || !hasAccess) return null;
    if (isHOD && profile?.departmentId) {
      return query(collection(db, 'colleges', collegeId, 'users'), where('departmentId', '==', profile.departmentId));
    }
    return collection(db, 'colleges', collegeId, 'users');
  }, [db, hasAccess, isHOD, profile?.departmentId]);

  const deptsQuery = useMemoFirebase(() => {
    if (!db || !hasAccess) return null;
    if (isHOD && profile?.departmentId) {
      return query(collection(db, 'colleges', collegeId, 'departments'), where('id', '==', profile.departmentId));
    }
    return collection(db, 'colleges', collegeId, 'departments');
  }, [db, hasAccess, isHOD, profile?.departmentId]);
  
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: depts, isLoading: deptsLoading } = useCollection(deptsQuery);

  const studentCount = users?.filter(u => u.role === 'student').length || 0;
  const facultyCount = users?.filter(u => u.role === 'faculty').length || 0;
  const deptCount = depts?.length || 0;

  const enrollmentData = depts?.map((d, i) => ({
    name: d.name,
    value: users?.filter(u => u.departmentId === d.id && u.role === 'student').length || 0,
    fill: enrollmentColors[i % enrollmentColors.length]
  })) || [];

  const stats = [
    { label: isHOD ? 'My Division' : 'Academic Divisions', value: deptCount.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/departments' },
    { label: 'Division Faculty', value: facultyCount.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', link: isHOD ? `/admin/departments/view?id=${profile?.departmentId}` : '/admin/faculty' },
    { label: 'Division Students', value: studentCount.toString(), icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', link: isHOD ? `/admin/departments/view?id=${profile?.departmentId}` : '/admin/students' },
    { label: 'System Status', value: '99.9%', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50', link: '#' },
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

  if (!hasAccess) {
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
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">
            {isHOD ? `${profile?.departmentId} Oversight` : 'Institutional Oversight'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isHOD ? `Head of Department management for ${profile?.departmentId}.` : 'Unified command for departments, performance, and infrastructure.'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" className="gap-2 bg-card" onClick={handleSeedData} disabled={isSeeding}>
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Provision Hierarchy
            </Button>
          )}
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
              <CardTitle className="text-lg font-headline font-bold">Growth Metrics</CardTitle>
              <CardDescription>Academic progression vs attendance rates for your division.</CardDescription>
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
                  <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-performance)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-performance)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={3} fill="url(#colorAttendance)" />
                <Area type="monotone" dataKey="performance" stroke="var(--color-performance)" strokeWidth={3} fill="url(#colorPerformance)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Student Split
            </CardTitle>
            <CardDescription>Enrollment per class section</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {enrollmentData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                  <span className="text-[10px] font-bold uppercase truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-headline font-bold">Division Efficiency</CardTitle>
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
              <Link href="/admin/departments">View Detailed Analysis</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="font-bold text-lg font-headline">Operational Load</p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Your division resource allocation is optimized. Current capacity is at 84%.
          </p>
          <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-12">
            Request Resource Scaling
          </Button>
        </Card>
      </div>
    </div>
  );
}
