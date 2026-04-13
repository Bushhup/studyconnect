
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, Users, GraduationCap, BookOpen, 
  Calendar, ArrowLeft, Loader2, Plus, 
  ChevronRight, TrendingUp, CheckCircle2,
  UserPlus, BookPlus, LayoutGrid, Search,
  Check, Layers, RefreshCcw
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { StudentBioHover } from '@/components/StudentBioHover';

const collegeId = 'study-connect-college';

export default function DepartmentViewClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Dialog States
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [isBatchOpsOpen, setIsBatchOpsOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<'student' | 'faculty'>('student');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Batch Ops State
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchAction, setBatchAction] = useState<'promote' | 'graduate'>('promote');

  // Fetch Dept
  const deptRef = useMemoFirebase(() => id ? doc(firestore, 'colleges', collegeId, 'departments', id) : null, [firestore, id]);
  const { data: dept, isLoading: deptLoading } = useDoc(deptRef);

  // Fetch Entities already in this dept
  const usersQuery = useMemoFirebase(() => 
    id ? query(collection(firestore, 'colleges', collegeId, 'users'), where('departmentId', '==', id)) : null
  , [firestore, id]);
  
  const classesQuery = useMemoFirebase(() => 
    id ? query(collection(firestore, 'colleges', collegeId, 'classes'), where('departmentId', '==', id)) : null
  , [firestore, id]);

  const coursesQuery = useMemoFirebase(() => 
    id ? query(collection(firestore, 'colleges', collegeId, 'courses'), where('departmentId', '==', id)) : null
  , [firestore, id]);

  // Fetch Global Users for Assignment
  const globalUsersQuery = useMemoFirebase(() => 
    query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', assignRole))
  , [firestore, assignRole]);

  const { data: deptUsers, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: courses, isLoading: coursesLoading } = useCollection(coursesQuery);
  const { data: allGlobalUsers, isLoading: globalLoading } = useCollection(globalUsersQuery);

  if (!id) return <div className="p-20 text-center">Invalid Department Reference</div>;

  if (deptLoading || usersLoading || classesLoading || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aggregating Division Data...</p>
      </div>
    );
  }

  const students = deptUsers?.filter(u => u.role === 'student' && u.status !== 'alumni') || [];
  const faculty = deptUsers?.filter(u => u.role === 'faculty') || [];

  // Extract unique batches from students
  const batches = Array.from(new Set(students.map(s => s.batchYear).filter(Boolean))) as string[];

  const availableUsers = allGlobalUsers?.filter(u => {
    const isNotInDept = u.departmentId !== id;
    const nameMatch = `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(userSearchQuery.toLowerCase());
    return isNotInDept && nameMatch;
  }) || [];

  const totalSemesters = dept?.totalSemesters || (dept?.programType === 'PG' ? 4 : 8);
  const semesterOptions = Array.from({ length: totalSemesters }, (_, i) => i + 1);

  const handleCreateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const semester = formData.get('semester') as string;

    const ref = collection(firestore, 'colleges', collegeId, 'classes');
    addDocumentNonBlocking(ref, {
      id: crypto.randomUUID(),
      name,
      semester,
      departmentId: id,
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Section Created', description: `${name} has been added to the department.` });
    setIsAddClassOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const credits = parseInt(formData.get('credits') as string);

    const ref = collection(firestore, 'colleges', collegeId, 'courses');
    addDocumentNonBlocking(ref, {
      id: crypto.randomUUID(),
      name,
      code,
      credits,
      departmentId: id,
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Subject Provisioned', description: `${name} (${code}) added to curriculum.` });
    setIsAddSubjectOpen(false);
  };

  const handleBatchOperation = () => {
    if (!selectedBatch) return;

    const batchStudents = students.filter(s => s.batchYear === selectedBatch);
    if (batchStudents.length === 0) {
      toast({ variant: 'destructive', title: 'Batch Empty', description: 'No students found in the selected batch.' });
      return;
    }

    batchStudents.forEach(s => {
      const userRef = doc(firestore, 'colleges', collegeId, 'users', s.id);
      if (batchAction === 'promote') {
        const currentSem = parseInt(s.semester || '1');
        const nextSem = currentSem < totalSemesters ? currentSem + 1 : currentSem;
        updateDocumentNonBlocking(userRef, { semester: nextSem.toString() });
      } else {
        updateDocumentNonBlocking(userRef, { status: 'alumni' });
      }
    });

    toast({ 
      title: 'Batch Synchronized', 
      description: `Bulk ${batchAction === 'promote' ? 'promotion' : 'graduation'} processed for ${batchStudents.length} students in ${selectedBatch}.` 
    });
    setIsBatchOpsOpen(false);
  };

  const handleAssignUser = (userId: string, userName: string) => {
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    updateDocumentNonBlocking(userRef, {
      departmentId: id,
      updatedAt: new Date().toISOString()
    });

    toast({ 
      title: 'User Assigned', 
      description: `${userName} has been successfully mapped to ${dept?.name}.` 
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm">
            <Link href="/admin/departments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{dept?.name}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase text-[10px]">
                {dept?.programType || 'UG'} Program
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 font-body">Master management hub • {totalSemesters} Semesters Curriculum.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBatchOpsOpen} onOpenChange={setIsBatchOpsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2 bg-card border-primary/20 text-primary font-bold">
                <Layers className="h-4 w-4" /> Batch Operations
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>Batch Management</DialogTitle>
                <DialogDescription>Promote or graduate students in bulk based on their batch year.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Batch</Label>
                  <Select onValueChange={setSelectedBatch} value={selectedBatch}>
                    <SelectTrigger className="bg-muted border-none h-12"><SelectValue placeholder="Pick a Batch" /></SelectTrigger>
                    <SelectContent>
                      {batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select onValueChange={(v: any) => setBatchAction(v)} value={batchAction}>
                    <SelectTrigger className="bg-muted border-none h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promote">Promote to Next Semester</SelectItem>
                      <SelectItem value="graduate">Mark as Alumni (Graduate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleBatchOperation} className="w-full h-12 font-bold uppercase tracking-tight">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Process Batch Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => toast({ title: 'Division Sync', description: 'Institutional architecture synchronized.' })} className="rounded-full shadow-lg shadow-primary/20">Sync Node</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Faculty" value={faculty.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total Students" value={students.length} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Course Modules" value={courses?.length || 0} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Active Sections" value={classes?.length || 0} icon={Calendar} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <TabsList className="bg-card border h-14 p-1.5 rounded-2xl flex justify-start overflow-x-auto w-full sm:w-auto">
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

          <div className="flex gap-2">
            <TabsContent value="classes" className="m-0" forceMount>
              <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 border-primary/20 text-primary">
                    <Plus className="h-3 w-3" /> Provision Section
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle>Provision New Academic Section</DialogTitle>
                    <DialogDescription>Define a batch for the {dept?.programType} program.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Section Name</Label>
                      <Input name="name" placeholder="e.g. CSE - Section A" required className="bg-muted border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Semester</Label>
                      <Select name="semester" required>
                        <SelectTrigger className="bg-muted border-none h-12"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                        <SelectContent>
                          {semesterOptions.map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight shadow-lg shadow-primary/20">Confirm Creation</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="subjects" className="m-0" forceMount>
              <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 border-primary/20 text-primary">
                    <BookPlus className="h-3 w-3" /> New Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle>Provision Subject Node</DialogTitle>
                    <DialogDescription>Add a new course module to the department curriculum.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubject} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Subject Name</Label>
                      <Input name="name" placeholder="e.g. Advanced Machine Learning" required className="bg-muted border-none h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Course Code</Label>
                        <Input name="code" placeholder="CS-402" required className="bg-muted border-none h-12 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label>Credits</Label>
                        <Input name="credits" type="number" defaultValue="4" required className="bg-muted border-none h-12" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight shadow-lg shadow-primary/20">Archive Subject Node</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="classes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes?.map(cls => (
              <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group bg-card">
                <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{cls.name}</CardTitle>
                    <Badge className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px]">Sem {cls.semester || 'N/A'}</Badge>
                  </div>
                  <CardDescription>Section Management Portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Active Enrollment</span>
                    <span className="text-foreground">{cls.studentIds?.length || 0} Students</span>
                  </div>
                  <Progress value={84} className="h-1" />
                  <Button asChild className="w-full rounded-xl h-11 font-bold group-hover:shadow-lg transition-all">
                    <Link href={`/admin/class-portal?id=${cls.id}`}>
                      Open Class Portal <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faculty">
          <div className="flex justify-end mb-4">
            <Button size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 shadow-lg shadow-blue-500/20" onClick={() => {setAssignRole('faculty'); setIsAssignUserOpen(true);}}>
              <UserPlus className="h-3 w-3" /> Assign Faculty from Directory
            </Button>
          </div>
          <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y border-t mt-4">
                {faculty.map(f => (
                  <div key={f.id} className="p-6 flex items-center justify-between group hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">{f.firstName?.[0]}{f.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">Dr. {f.firstName} {f.lastName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{f.designation || 'Faculty Member'}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {batches.map(b => (
                <Badge key={b} className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] px-3">{b}</Badge>
              ))}
            </div>
            <Button size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700" onClick={() => {setAssignRole('student'); setIsAssignUserOpen(true);}}>
              <UserPlus className="h-3 w-3" /> Enroll Students from Directory
            </Button>
          </div>
          <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-4">
                {students.map(s => (
                  <StudentBioHover key={s.id} student={s}>
                    <div className="p-4 rounded-2xl bg-muted/30 flex items-center justify-between group hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-card border flex items-center justify-center font-bold text-xs uppercase">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{s.firstName} {s.lastName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase">Sem {s.semester}</p>
                            <Badge className="h-3.5 px-1 bg-primary/10 text-primary text-[7px] font-bold border-none uppercase">{s.batchYear}</Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[9px] uppercase">Active</Badge>
                    </div>
                  </StudentBioHover>
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
                  <Badge variant="outline" className="w-fit border-primary/20 text-primary font-bold mb-2 uppercase text-[9px]">{course.code}</Badge>
                  <CardTitle className="text-base font-headline">{course.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase text-[9px]">Credits</span>
                    <span>{course.credits} Units</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Picker Dialog */}
      <Dialog open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
        <DialogContent className="rounded-[2rem] max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Directory Assignment</DialogTitle></DialogHeader>
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search directory..." 
              className="pl-10 bg-muted border-none h-12 rounded-xl"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {availableUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback>{u.firstName?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-bold">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-primary uppercase font-bold">@{u.username}</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-full text-[9px] font-bold" onClick={() => handleAssignUser(u.id, u.firstName)}>Assign</Button>
              </div>
            ))}
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
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
