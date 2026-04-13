
'use client';

import { use, useState } from 'react';
import { 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  useUser 
} from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, Users, GraduationCap, BookOpen, 
  Calendar, ArrowLeft, Loader2, Plus, 
  ChevronRight, ArrowUpRight, TrendingUp,
  FileSpreadsheet, ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

// Required for output: export with dynamic routes
export function generateStaticParams() {
  return [];
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch Dept
  const deptRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId, 'departments', id), [firestore, id]);
  const { data: dept, isLoading: deptLoading } = useDoc(deptRef);

  // Fetch Dept-linked Entities
  const usersQuery = useMemoFirebase(() => 
    query(collection(firestore, 'colleges', collegeId, 'users'), where('departmentId', '==', id))
  , [firestore, id]);
  
  const classesQuery = useMemoFirebase(() => 
    query(collection(firestore, 'colleges', collegeId, 'classes'), where('departmentId', '==', id))
  , [firestore, id]);

  const coursesQuery = useMemoFirebase(() => 
    query(collection(firestore, 'colleges', collegeId, 'courses'), where('departmentId', '==', id))
  , [firestore, id]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: courses, isLoading: coursesLoading } = useCollection(coursesQuery);

  if (deptLoading || usersLoading || classesLoading || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aggregating Division Data...</p>
      </div>
    );
  }

  const students = users?.filter(u => u.role === 'student') || [];
  const faculty = users?.filter(u => u.role === 'faculty') || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm">
            <Link href="/admin/departments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{dept?.name}</h1>
            <p className="text-muted-foreground mt-1 font-body">Master management hub for this academic division.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full bg-card">Division Reports</Button>
          <Button className="rounded-full shadow-lg shadow-primary/20">Edit Division</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Faculty" value={faculty.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total Students" value={students.length} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Course Modules" value={courses?.length || 0} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Active Sections" value={classes?.length || 0} icon={Calendar} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="bg-card border h-14 p-1.5 rounded-2xl mb-8 flex justify-start overflow-x-auto">
          <TabsTrigger value="classes" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calendar className="h-4 w-4" /> Academic Sections
          </TabsTrigger>
          <TabsTrigger value="faculty" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="h-4 w-4" /> Faculty Handlers
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <GraduationCap className="h-4 w-4" /> Student Roster
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <BookOpen className="h-4 w-4" /> Curriculum
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes?.map(cls => (
              <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group bg-card">
                <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{cls.name}</CardTitle>
                    <Badge className="bg-primary/5 text-primary border-none">Sem {cls.semester || 'N/A'}</Badge>
                  </div>
                  <CardDescription>Active cohort management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Performance Avg</span>
                    <span className="text-foreground">84%</span>
                  </div>
                  <Progress value={84} className="h-1" />
                  <Button asChild className="w-full rounded-xl h-11 font-bold group-hover:shadow-lg transition-all">
                    <Link href={`/admin/classes/${cls.id}`}>
                      Open Class Portal <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            <button className="h-full min-h-[200px] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-muted/30 transition-all text-muted-foreground">
              <Plus className="h-8 w-8" />
              <span className="font-bold uppercase text-[10px] tracking-widest">Provision New Section</span>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="faculty">
          <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y border-t mt-4">
                {faculty.map(f => (
                  <div key={f.id} className="p-6 flex items-center justify-between group hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{f.firstName?.[0]}{f.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">Dr. {f.firstName} {f.lastName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{f.designation || 'Faculty Member'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Impact Score</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-emerald-600">{f.performanceScore || 92}%</span>
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-4">
                {students.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-card border flex items-center justify-center font-bold text-xs">
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{s.firstName} {s.lastName}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">#{s.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses?.map(course => (
              <Card key={course.id} className="border-none shadow-sm rounded-2xl bg-card">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="w-fit border-primary/20 text-primary font-bold mb-2">{course.code}</Badge>
                  <CardTitle className="text-base font-headline">{course.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Academic Credits</span>
                    <span className="font-bold">{course.credits} Units</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl", bg)}>
          <Icon className={cn("h-6 w-6", color)} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
