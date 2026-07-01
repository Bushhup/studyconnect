'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  useUser,
  updateDocumentNonBlocking
} from '@/firebase';
import { doc, collection, query, where, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, Users, GraduationCap, BookOpen, 
  Calendar, ArrowLeft, Loader2, Plus, 
  ChevronRight, TrendingUp, Search,
  RefreshCcw, UserPlus, BookPlus, LayoutGrid, Info, Download, AlertCircle, BarChart3,
  LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider, Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { StudentBioHover } from '@/components/StudentBioHover';
import { FacultyBioHover } from '@/components/FacultyBioHover';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart as ReAreaChart, 
  Area as ReArea, 
  BarChart as ReBarChart, 
  Bar as ReBar, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis, 
  CartesianGrid as ReCartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer as ReResponsiveContainer,
  Cell as ReCell
} from 'recharts';

const collegeId = 'study-connect-college';
const STUDENT_COLUMNS = ['firstName', 'lastName', 'email', 'mobileNumber', 'batchYear', 'semester'];

const performanceData = [
  { term: 'Sem 1', gpa: 3.2, avg: 3.0 },
  { term: 'Sem 2', gpa: 3.5, avg: 3.1 },
  { term: 'Sem 3', gpa: 3.4, avg: 3.2 },
  { term: 'Sem 4', gpa: 3.8, avg: 3.4 },
];

const sectionComparison = [
  { name: 'Sec A', score: 92 },
  { name: 'Sec B', score: 85 },
  { name: 'Sec C', score: 78 },
  { name: 'Sec D', score: 88 },
];

export default function DepartmentViewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('classes');
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<'student' | 'faculty'>('student');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // User Profile for Authorization
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  const isAdmin = profile?.role === 'admin';
  const isHOD = profile?.role === 'hod';
  const myDeptId = profile?.departmentId;

  // Security Check: Redirect HOD if they try to access a department they don't own
  useEffect(() => {
    if (!profileLoading && isHOD && id && id !== myDeptId) {
      router.replace('/admin/dashboard');
      toast({ variant: 'destructive', title: 'Access Restricted', description: 'HODs are restricted to their assigned department portals.' });
    }
  }, [profileLoading, isHOD, id, myDeptId, router]);

  // Data lookups
  const deptRef = useMemoFirebase(() => id ? doc(firestore, 'colleges', collegeId, 'departments', id) : null, [firestore, id]);
  const { data: dept, isLoading: deptLoading } = useDoc(deptRef);

  const usersQuery = useMemoFirebase(() => id ? query(collection(firestore, 'colleges', collegeId, 'users'), where('departmentId', '==', id)) : null, [firestore, id]);
  const classesQuery = useMemoFirebase(() => id ? query(collection(firestore, 'colleges', collegeId, 'classes'), where('departmentId', '==', id)) : null, [firestore, id]);
  const coursesQuery = useMemoFirebase(() => id ? query(collection(firestore, 'colleges', collegeId, 'courses'), where('departmentId', '==', id)) : null, [firestore, id]);
  const globalUsersQuery = useMemoFirebase(() => query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', assignRole)), [firestore, assignRole]);

  const { data: deptUsers, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: courses, isLoading: coursesLoading } = useCollection(coursesQuery);
  const { data: allGlobalUsers } = useCollection(globalUsersQuery);

  if (!id) return <div className="p-20 text-center font-bold uppercase tracking-widest text-muted-foreground italic">Invalid Division Identity</div>;

  if (profileLoading || deptLoading || usersLoading || classesLoading || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Division Node...</p>
      </div>
    );
  }

  // Double-Check Scoping Security 
  if (isHOD && id !== myDeptId) {
    return null; // The useEffect handle redirection, this prevents flash of data
  }

  const students = deptUsers?.filter(u => u.role === 'student' && u.status !== 'alumni') || [];
  const faculty = deptUsers?.filter(u => u.role === 'faculty') || [];
  const batches = Array.from(new Set(students.map(s => s.batchYear).filter(Boolean))) as string[];

  const availableUsers = allGlobalUsers?.filter(u => {
    const isNotInDept = u.departmentId !== id;
    const nameMatch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearchQuery.toLowerCase());
    return isNotInDept && nameMatch;
  }) || [];

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const semester = formData.get('semester') as string;
    const classId = `class-${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 4)}`;

    await setDoc(doc(firestore, 'colleges', collegeId, 'classes', classId), {
      id: classId, name, semester, departmentId: id, studentIds: [], createdAt: new Date().toISOString()
    });

    toast({ title: 'Section Provisioned', description: `${name} is now active in the directory.` });
    setIsAddClassOpen(false);
  };

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const credits = parseInt(formData.get('credits') as string);
    const courseId = `course-${code.toLowerCase().replace(/\s+/g, '-')}`;

    await setDoc(doc(firestore, 'colleges', collegeId, 'courses', courseId), {
      id: courseId, name, code, credits, departmentId: id, createdAt: new Date().toISOString()
    });

    toast({ title: 'Curriculum Updated', description: `${name} has been added to the master syllabus.` });
    setIsAddSubjectOpen(false);
  };

  const downloadTemplate = () => {
    const csvContent = `data:text/csv;charset=utf-8,${STUDENT_COLUMNS.join(',')}\nJohn,Doe,john.d@college.edu,1234567890,Batch-2027,1`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `department_${dept?.name}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Template Exported', description: 'Headers: ' + STUDENT_COLUMNS.join(', ') });
  };

  const handleAssignUser = (userId: string, userName: string) => {
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    updateDocumentNonBlocking(userRef, { departmentId: id, updatedAt: new Date().toISOString() });
    toast({ title: 'Identity Linked', description: `${userName} is now mapped to this division.` });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {!isHOD && (
            <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm hover:bg-primary/5 transition-colors">
              <Link href="/admin/departments"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{dept?.name}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase text-[10px] px-3">
                {dept?.programType || 'UG'} Management
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 font-body">Academic command center for section rosters and curriculum mapping.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <UiTooltip>
              <TooltipTrigger asChild>
                <Button onClick={downloadTemplate} variant="outline" className="rounded-full gap-2 bg-card border-primary/20 text-primary font-bold">
                  <Download className="h-4 w-4" /> Export Format
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white rounded-xl p-3 max-w-xs">
                <p className="text-[10px] font-bold uppercase mb-1">Required Headers</p>
                <code className="text-[9px] break-all">{STUDENT_COLUMNS.join(', ')}</code>
              </TooltipContent>
            </UiTooltip>
          </TooltipProvider>
          <Button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "rounded-full shadow-lg h-11 px-8 font-bold gap-2 transition-all",
              activeTab === 'analytics' ? "bg-primary text-white" : "bg-card text-primary border border-primary/20 shadow-primary/10"
            )}
          >
            <BarChart3 className="h-4 w-4" /> Performance Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Faculty" value={faculty.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total Enrollment" value={students.length} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Syllabus Nodes" value={courses?.length || 0} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Allotted Sections" value={classes?.length || 0} icon={LayoutGrid} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b pb-4">
          <TabsList className="bg-card border h-14 p-1.5 rounded-2xl flex justify-start overflow-x-auto w-full sm:w-auto">
            <TabsTrigger value="classes" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px]">Sections</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px]">Faculty</TabsTrigger>
            <TabsTrigger value="students" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px]">Students</TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px]">Curriculum</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px]">Analytics</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {activeTab === 'classes' && (
              <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 border-primary/20 text-primary bg-card">
                    <Plus className="h-3 w-3" /> New Section
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Provision Academic Section</DialogTitle>
                    <DialogDescription>Initialize a new student batch for {dept?.name}.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Section Title</Label>
                      <Input name="name" placeholder="e.g. CSE - Section C" required className="bg-muted border-none h-12 rounded-xl shadow-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Semester</Label>
                      <Input name="semester" type="number" defaultValue="1" required className="bg-muted border-none h-12 rounded-xl shadow-none" />
                    </div>
                    <Button type="submit" className="w-full h-14 font-bold uppercase shadow-lg shadow-primary/20 rounded-xl mt-2">Create Section</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'subjects' && (
              <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 border-primary/20 text-primary bg-card">
                    <BookPlus className="h-3 w-3" /> Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl">
                  <DialogHeader><DialogTitle>Provision Syllabus Node</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateSubject} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Subject Name</Label>
                      <Input name="name" placeholder="e.g. Cloud Computing" required className="bg-muted border-none h-12 rounded-xl shadow-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Course Code</Label>
                        <Input name="code" placeholder="CS-501" required className="bg-muted border-none h-12 rounded-xl shadow-none font-mono uppercase" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Credits</Label>
                        <Input name="credits" type="number" defaultValue="4" className="bg-muted border-none h-12 rounded-xl shadow-none" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 font-bold uppercase shadow-lg shadow-primary/20 rounded-xl mt-2">Commit to Syllabus</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent key={`tab-content-${activeTab}`} value={activeTab}>
            {activeTab === 'classes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes?.map((cls, idx) => (
                  <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group bg-card h-full flex flex-col">
                      <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                      <CardHeader className="flex-grow">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-headline font-bold text-foreground">{cls.name}</CardTitle>
                          <Badge className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px]">Sem {cls.semester}</Badge>
                        </div>
                        <CardDescription className="text-xs font-medium">Allotted section node.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5 pt-0">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>Enrollment Count</span>
                          <span className="text-foreground">{cls.studentIds?.length || 0} Students</span>
                        </div>
                        <Button asChild className="w-full rounded-xl h-11 font-bold group-hover:shadow-lg transition-all">
                          <Link href={`/admin/class-portal?id=${cls.id}`}>Open Roster Ledger <ChevronRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {classes?.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
                    <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                    <p className="font-bold text-muted-foreground">No sections have been provisioned yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faculty' && (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <Button size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 shadow-lg bg-primary" onClick={() => {setAssignRole('faculty'); setIsAssignUserOpen(true);}}>
                    <UserPlus className="h-3 w-3" /> Map from Directory
                  </Button>
                </div>
                <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-muted/50">
                      {faculty.map((f, idx) => (
                        <FacultyBioHover key={f.id || `f-${idx}`} faculty={f}>
                          <div className="p-6 flex items-center justify-between group hover:bg-muted/30 transition-all cursor-help">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 border-2 border-background shadow-sm"><AvatarFallback className="bg-primary/5 text-primary font-bold">{f.firstName?.[0]}{f.lastName?.[0]}</AvatarFallback></Avatar>
                              <div>
                                <p className="font-bold text-foreground">Dr. {f.firstName} {f.lastName}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{f.designation || 'Academic Staff'}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-xl font-bold uppercase text-[9px] hover:bg-primary hover:text-white" asChild>
                              <Link href={`/admin/faculty?search=${f.email}`}>Professional Bio</Link>
                            </Button>
                          </div>
                        </FacultyBioHover>
                      ))}
                      {faculty.length === 0 && (
                        <div className="p-20 text-center text-muted-foreground italic">No faculty members mapped to this division.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    {batches.map(b => <Badge key={b} className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] px-3 h-6 flex items-center">{b}</Badge>)}
                  </div>
                  <Button size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 shadow-lg bg-primary" onClick={() => {setAssignRole('student'); setIsAssignUserOpen(true);}}>
                    <UserPlus className="h-3 w-3" /> Onboard Records
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((s, idx) => (
                    <StudentBioHover key={s.id || `s-${idx}`} student={s}>
                      <Card className="p-4 border-none shadow-sm bg-card rounded-2xl flex items-center justify-between group hover:bg-primary/5 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-xs uppercase text-primary">
                            {s.firstName?.[0]}{s.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[120px]">{s.firstName} {s.lastName}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Sem {s.semester}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[8px] uppercase">Active</Badge>
                      </Card>
                    </StudentBioHover>
                  ))}
                  {students.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
                      <p className="text-sm font-bold text-muted-foreground">No students enrolled in this division.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses?.map((course, idx) => (
                  <Card key={course.id || `c-${idx}`} className="border-none shadow-sm rounded-[1.5rem] bg-card hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <Badge variant="outline" className="w-fit border-primary/20 text-primary font-bold mb-2 uppercase text-[9px] px-3">{course.code}</Badge>
                      <CardTitle className="text-base font-headline font-bold leading-tight">{course.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 border-t border-dashed mt-4">
                      <div className="flex items-center justify-between text-xs font-bold pt-4">
                        <span className="text-muted-foreground uppercase text-[9px]">Academic Units</span>
                        <span>{course.credits} Credits</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {courses?.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
                    <p className="text-sm font-bold text-muted-foreground">Curriculum nodes not defined for this program.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="border-b pb-8">
                      <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="text-xl font-headline font-bold">Academic Growth Curve</CardTitle>
                            <CardDescription>Comparative GPA trends across semesters.</CardDescription>
                         </div>
                         <Badge variant="outline" className="bg-primary/5 text-primary border-none px-4 py-1.5 font-bold uppercase text-[9px]">Term Sync: Live</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-8">
                      <ReResponsiveContainer width="100%" height="100%">
                        <ReAreaChart data={performanceData}>
                          <defs>
                            <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <ReXAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }} />
                          <ReYAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                          <ReTooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                          />
                          <ReArea type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorGpa)" />
                          <ReArea type="monotone" dataKey="avg" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                        </ReAreaChart>
                      </ReResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-primary text-white rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
                      <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
                      <div className="relative z-10 space-y-4">
                        <Badge className="bg-white/20 text-white border-none uppercase text-[9px] font-bold px-3 h-6 flex items-center w-fit rounded-full">Top Performer</Badge>
                        <h3 className="text-2xl font-headline font-bold leading-tight">Elite Efficiency</h3>
                        <p className="text-sm text-white/70 leading-relaxed font-body">
                          This department maintains a <strong>94.2%</strong> average success rate in final examinations.
                        </p>
                      </div>
                      <Button asChild className="w-full bg-white text-primary hover:bg-slate-100 font-bold rounded-2xl h-14 relative z-10 shadow-xl text-xs uppercase tracking-widest">
                        <Link href={`/admin/marks?deptId=${id}`}>Full Performance Hub</Link>
                      </Button>
                    </Card>

                    <Card className="border-none shadow-sm bg-card rounded-[2rem] p-8 space-y-4">
                       <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Internal Benchmarks</p>
                          <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-xs font-bold">
                                <span>Placement Rate</span>
                                <span className="text-emerald-600">96.8%</span>
                             </div>
                             <Progress value={96.8} className="h-1 bg-muted" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-xs font-bold">
                                <span>Innovation Index</span>
                                <span className="text-primary">8.4 / 10</span>
                             </div>
                             <Progress value={84} className="h-1 bg-muted" />
                          </div>
                       </div>
                    </Card>
                  </div>
                </div>

                <Card className="border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline font-bold">Sectional Comparison</CardTitle>
                    <CardDescription>Performance metrics across all active class nodes.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ReResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={sectionComparison}>
                        <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <ReXAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '600', fill: 'hsl(var(--foreground))' }} />
                        <ReYAxis hide />
                        <ReTooltip 
                          cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                        />
                        <ReBar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                           {sectionComparison.map((entry, index) => (
                             <ReCell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)'} />
                           ))}
                        </ReBar>
                      </ReBarChart>
                    </ReResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Assignment Picker Dialog */}
      <Dialog open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[80vh] flex flex-col border-none shadow-2xl bg-card">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Directory Mapping</DialogTitle></DialogHeader>
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter global identities..." className="pl-10 bg-muted border-none h-12 rounded-xl shadow-none" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {availableUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="font-bold text-xs bg-card">{u.firstName?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-primary font-bold">{u.email}</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-full text-[10px] font-bold uppercase h-8 px-4" onClick={() => handleAssignUser(u.id, u.firstName)}>Link Identity</Button>
              </div>
            ))}
            {availableUsers.length === 0 && <p className="text-center py-10 text-xs font-bold text-muted-foreground uppercase opacity-40 italic">No available identities found matching criteria.</p>}
          </div>
        </DialogContent>
      </Dialog>
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
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
