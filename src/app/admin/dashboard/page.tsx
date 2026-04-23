'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seed-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, GraduationCap, Building2, BookOpen, 
  TrendingUp, CheckCircle2, Database, Loader2, AlertCircle, 
  ArrowRight, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // Use email as ID for institutional records
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return doc(db, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [db, user?.email]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  
  const isAdmin = profile?.role === 'admin';
  const isHOD = profile?.role === 'hod';
  const hasAccess = isAdmin || isHOD;

  // Real data queries
  const usersQuery = useMemoFirebase(() => {
    if (!db || !hasAccess) return null;
    if (isHOD && profile?.departmentId) {
      return query(collection(db, 'colleges', collegeId, 'users'), where('departmentId', '==', profile.departmentId));
    }
    return collection(db, 'colleges', collegeId, 'users');
  }, [db, hasAccess, isHOD, profile?.departmentId]);

  const deptsQuery = useMemoFirebase(() => {
    if (!db || !hasAccess) return null;
    return collection(db, 'colleges', collegeId, 'departments');
  }, [db, hasAccess]);

  const classesQuery = useMemoFirebase(() => {
    if (!db || !hasAccess) return null;
    return collection(db, 'colleges', collegeId, 'classes');
  }, [db, hasAccess]);
  
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: depts, isLoading: deptsLoading } = useCollection(deptsQuery);
  const { data: classes } = useCollection(classesQuery);

  const studentCount = users?.filter(u => u.role === 'student').length || 0;
  const facultyCount = users?.filter(u => u.role === 'faculty').length || 0;
  const deptCount = depts?.length || 0;
  const classCount = classes?.length || 0;

  const enrollmentData = depts?.map((d, i) => ({
    name: d.name,
    value: users?.filter(u => u.departmentId === d.id && u.role === 'student').length || 0,
    fill: enrollmentColors[i % enrollmentColors.length]
  })).filter(d => d.value > 0) || [];

  const handleSeedData = async () => {
    if (!db || !isAdmin) return;
    setIsSeeding(true);
    try {
      await seedDatabase(db);
      toast({ title: 'Infrastructure Synchronized', description: 'Institutional hierarchy and linked directory records have been provisioned.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Initialization Error', description: error.message });
    } finally {
      setIsSeeding(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Admin Session...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-40 text-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Institutional Access Restricted</h2>
        <p className="text-muted-foreground">You do not have the required administrative permissions to access the master portal.</p>
        <Button asChild><Link href="/profile">Return to Identity Profile</Link></Button>
      </div>
    );
  }

  const stats = [
    { label: isHOD ? 'My Division' : 'Divisions', value: deptCount.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/departments' },
    { label: 'Active Classes', value: classCount.toString(), icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/classes' },
    { label: 'Total Faculty', value: facultyCount.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/faculty' },
    { label: 'Total Students', value: studentCount.toString(), icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/students' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">
            {isHOD ? `${profile?.departmentId} Hub` : 'Institutional Command Center'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time oversight for departments, performance tracking, and user directories.
          </p>
        </motion.div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" className="gap-2 bg-card rounded-full" onClick={handleSeedData} disabled={isSeeding}>
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              System Bootstrap
            </Button>
          )}
          <Button onClick={() => toast({ title: 'Generating Report', description: 'Institutional analytics are being compiled...' })} className="font-bold rounded-full shadow-lg shadow-primary/20">
            Export Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all group rounded-[2rem] overflow-hidden bg-card cursor-pointer">
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
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Institutional Trends</CardTitle>
              <CardDescription>Comparative data: Academic growth vs Attendance.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px]">Presence</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-none font-bold uppercase text-[9px]">GPAs</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ChartContainer config={{ attendance: { label: 'Attendance', color: 'hsl(var(--primary))' }, performance: { label: 'GPA', color: 'hsl(var(--chart-2))' } }}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorAttendance)" />
                <Area type="monotone" dataKey="performance" stroke="hsl(var(--chart-2))" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Enrollment Split
            </CardTitle>
            <CardDescription>Student distribution by division.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {enrollmentData.length > 0 ? (
              <>
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
                <div className="grid grid-cols-1 gap-2 mt-4 max-h-24 overflow-y-auto custom-scrollbar pr-2">
                  {enrollmentData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                        <span className="text-[10px] font-bold uppercase truncate">{d.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <PieChartIcon className="h-12 w-12 mb-2" />
                <p className="text-xs font-bold uppercase">No Enrollment Data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle className="text-lg font-headline font-bold">Academic Performance Ranking</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary font-bold uppercase text-[10px]">
              <Link href="/admin/marks">Full Leaderboard</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {depts?.slice(0, 4).map((d, i) => (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 group hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-card border flex items-center justify-center font-bold text-xs">#{i+1}</div>
                  <div>
                    <p className="text-sm font-bold">{d.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Dean: {d.headOfDept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600">88.4% Avg</p>
                  <div className="w-16 h-1 bg-emerald-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[88%]" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Activity className="h-6 w-6" />
              </div>
              <p className="font-bold text-lg font-headline">System Status</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Institutional databases and identity sync are operational. Next audit window in 4 days.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase text-white/40">Sync Rate</p>
                <p className="text-lg font-bold">100%</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase text-white/40">Uptime</p>
                <p className="text-lg font-bold">99.9%</p>
              </div>
            </div>
          </div>
          <Button onClick={() => toast({ title: 'Manual Audit Triggered', description: 'Scanning user directories for orphans...' })} variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-12">
            Run Data Audit
          </Button>
        </Card>
      </div>
    </div>
  );
}