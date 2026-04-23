'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
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
  Layers, RefreshCcw, UserPlus, BookPlus, LayoutGrid
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
import { motion, AnimatePresence } from 'framer-motion';

const collegeId = 'study-connect-college';

export default function DepartmentViewClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<'student' | 'faculty'>('student');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Data
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

  if (!id) return <div className="p-20 text-center font-bold uppercase tracking-widest text-muted-foreground">Invalid Division ID</div>;

  if (deptLoading || usersLoading || classesLoading || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Division Nodes...</p>
      </div>
    );
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
    const classId = `class-${name.toLowerCase().replace(/\s+/g, '-')}`;

    await setDoc(doc(firestore, 'colleges', collegeId, 'classes', classId), {
      id: classId, name, semester, departmentId: id, studentIds: [], createdAt: new Date().toISOString()
    });

    toast({ title: 'Section Active', description: `${name} has been provisioned in the division.` });
    setIsAddClassOpen(false);
  };

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const credits = parseInt(formData.get('credits') as string);
    const courseId = `course-${code.toLowerCase()}`;

    await setDoc(doc(firestore, 'colleges', collegeId, 'courses', courseId), {
      id: courseId, name, code, credits, departmentId: id, createdAt: new Date().toISOString()
    });

    toast({ title: 'Curriculum Updated', description: `${name} added to division syllabus.` });
    setIsAddSubjectOpen(false);
  };

  const handleAssignUser = (userId: string, userName: string) => {
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    updateDocumentNonBlocking(userRef, { departmentId: id, updatedAt: new Date().toISOString() });
    toast({ title: 'Identity Linked', description: `${userName} mapped to ${dept?.name}.` });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm hover:bg-primary/5 transition-colors">
            <Link href="/admin/departments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{dept?.name}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase text-[10px]">
                {dept?.programType || 'UG'} Portal
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 font-body">Master management hub for academic operations and curriculum.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast({ title: 'Data Re-Sync', description: 'Institutional nodes updated.' })} variant="outline" className="rounded-full gap-2 bg-card border-primary/20 text-primary font-bold">
            <RefreshCcw className="h-4 w-4" /> Node Sync
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/20 h-11 px-8 font-bold">
            Division Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Divisional Faculty" value={faculty.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Active Enrollment" value={students.length} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Course Modules" value={courses?.length || 0} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Allotted Sections" value={classes?.length || 0} icon={LayoutGrid} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b pb-4">
          <TabsList className="bg-card border h-14 p-1.5 rounded-2xl flex justify-start overflow-x-auto w-full sm:w-auto">
            <TabsTrigger value="classes" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Academic Sections</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Faculty Handlers</TabsTrigger>
            <TabsTrigger value="students" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Student Roster</TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Division Syllabus</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <TabsContent value="classes" className="m-0" forceMount>
              <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 border-primary/20 text-primary">
                    <Plus className="h-3 w-3" /> Provision Section
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Academic Section</DialogTitle>
                    <DialogDescription>Initialize a new batch for {dept?.name}.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Section Identifier</Label>
                      <Input name="name" placeholder="e.g. CSE - Section C" required className="bg-muted border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Current Semester</Label>
                      <Input name="semester" type="number" defaultValue="1" required className="bg-muted border-none h-12" />
                    </div>
                    <Button type="submit" className="w-full h-14 font-bold uppercase shadow-lg">Confirm Creation</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="subjects" className="m-0" forceMount>
              <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 border-primary/20 text-primary">
                    <BookPlus className="h-3 w-3" /> Add Syllabus Node
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl">
                  <DialogHeader><DialogTitle>Provision Subject</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateSubject} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Subject Name</Label>
                      <Input name="name" placeholder="e.g. Cloud Architecture" required className="bg-muted border-none h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Course Code</Label>
                        <Input name="code" placeholder="CS-501" required className="bg-muted border-none h-12 font-mono uppercase" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Credits</Label>
                        <Input name="credits" type="number" defaultValue="4" className="bg-muted border-none h-12" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 font-bold uppercase shadow-lg">Commit to Curriculum</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="classes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes?.map((cls, idx) => (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group bg-card h-full flex flex-col">
                    <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                    <CardHeader className="flex-grow">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{cls.name}</CardTitle>
                        <Badge className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px]">Sem {cls.semester}</Badge>
                      </div>
                      <CardDescription>Allotted Section Node</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-0">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Enrollment Count</span>
                        <span className="text-foreground">{cls.studentIds?.length || 0} Students</span>
                      </div>
                      <Button asChild className="w-full rounded-xl h-11 font-bold group-hover:shadow-lg transition-all">
                        <Link href={`/admin/class-portal?id=${cls.id}`}>Open Section Ledger <ChevronRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faculty">
            <div className="flex justify-end mb-4">
              <Button size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 shadow-lg" onClick={() => {setAssignRole('faculty'); setIsAssignUserOpen(true);}}>
                <UserPlus className="h-3 w-3" /> Map Faculty from Directory
              </Button>
            </div>
            <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-muted/50">
                  {faculty.map(f => (
                    <div key={f.id} className="p-6 flex items-center justify-between group hover:bg-muted/30 transition-all">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm"><AvatarFallback className="bg-primary/5 text-primary font-bold">{f.firstName?.[0]}{f.lastName?.[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-bold text-foreground">Dr. {f.firstName} {f.lastName}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{f.designation || 'Academic Staff'}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-xl font-bold uppercase text-[9px] hover:bg-primary hover:text-white" asChild>
                        <Link href={`/admin/faculty?search=${f.email}`}>View Bio Card</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                {batches.map(b => <Badge key={b} className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] px-3">{b}</Badge>)}
              </div>
              <Button size="sm" className="rounded-xl gap-2 font-bold uppercase text-[10px] h-10 shadow-lg bg-primary" onClick={() => {setAssignRole('student'); setIsAssignUserOpen(true);}}>
                <UserPlus className="h-3 w-3" /> Add Student Records
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(s => (
                <StudentBioHover key={s.id} student={s}>
                  <Card className="p-4 border-none shadow-sm bg-card rounded-2xl flex items-center justify-between group hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-xs uppercase text-primary">
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[120px]">{s.firstName} {s.lastName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">Sem {s.semester}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[8px] uppercase">Active</Badge>
                  </Card>
                </StudentBioHover>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subjects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses?.map(course => (
                <Card key={course.id} className="border-none shadow-sm rounded-[1.5rem] bg-card hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <Badge variant="outline" className="w-fit border-primary/20 text-primary font-bold mb-2 uppercase text-[9px] px-3">{course.code}</Badge>
                    <CardTitle className="text-base font-headline font-bold leading-tight">{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 border-t border-dashed mt-4">
                    <div className="flex items-center justify-between text-xs font-bold pt-4">
                      <span className="text-muted-foreground uppercase text-[9px]">Units</span>
                      <span>{course.credits} Credits</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Assignment Picker Dialog */}
      <Dialog open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[80vh] flex flex-col border-none shadow-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Institutional Directory mapping</DialogTitle></DialogHeader>
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search global identities..." className="pl-10 bg-muted border-none h-12 rounded-xl" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {availableUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="font-bold text-xs">{u.firstName?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-bold">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-primary font-bold">{u.email}</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-full text-[10px] font-bold uppercase h-8 px-4" onClick={() => handleAssignUser(u.id, u.firstName)}>Link Node</Button>
              </div>
            ))}
            {availableUsers.length === 0 && <p className="text-center py-10 text-xs font-bold text-muted-foreground uppercase opacity-40 italic">No available identities found.</p>}
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