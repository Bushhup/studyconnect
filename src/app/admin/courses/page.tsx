'use client';

import { useState } from 'react';
import { 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  useUser, 
  useDoc, 
  setDocumentNonBlocking 
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, BookOpen, Search, Filter, 
  Loader2, UserCheck, TrendingUp, Clock, 
  Building2, GraduationCap, ArrowUpRight, 
  Database, Info, Layers, BookPlus, LayoutGrid,
  Trash2, Edit3, MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const collegeId = 'study-connect-college';

const COURSE_CSV_COLUMNS: CsvColumn[] = [
  { key: 'code', label: 'Course Code', description: 'Unique alphanumeric identifier.', example: 'CS101', required: true },
  { key: 'name', label: 'Course Title', description: 'Full name of the course.', example: 'Introduction to Data Structures', required: true },
  { key: 'credits', label: 'Credits', description: 'Academic weightage units.', example: '4', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'Mapping to a department.', example: 'dept-eng', required: true },
];

export default function CourseManagementPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Creation Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCredits, setNewCredits] = useState('4');
  const [newDeptId, setNewDeptId] = useState('');

  // Fetch Current Profile for Scoping
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile } = useDoc(profileRef);

  const isHOD = profile?.role === 'hod';
  const myDeptId = profile?.departmentId;

  // Fetch Data - Scoped strictly for HODs
  const deptsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'departments');
    if (isHOD) {
      if (!myDeptId) return null;
      return query(base, where('id', '==', myDeptId));
    }
    return base;
  }, [firestore, isHOD, myDeptId]);

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'courses');
    if (isHOD) {
      if (!myDeptId) return null;
      return query(base, where('departmentId', '==', myDeptId));
    }
    return base;
  }, [firestore, isHOD, myDeptId]);

  const classesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'classes');
    if (isHOD) {
      if (!myDeptId) return null;
      return query(base, where('departmentId', '==', myDeptId));
    }
    return base;
  }, [firestore, isHOD, myDeptId]);

  const facultyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'users');
    if (isHOD) {
      if (!myDeptId) return null;
      return query(base, where('departmentId', '==', myDeptId), where('role', '==', 'faculty'));
    }
    return query(base, where('role', '==', 'faculty'));
  }, [firestore, isHOD, myDeptId]);

  const recordsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'academicRecords'), [firestore]);

  const { data: depts, isLoading: deptsLoading } = useCollection(deptsQuery);
  const { data: courses, isLoading: coursesLoading } = useCollection(coursesQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: facultyMembers, isLoading: facultyLoading } = useCollection(facultyQuery);
  const { data: records, isLoading: recordsLoading } = useCollection(recordsQuery);

  const isLoading = deptsLoading || coursesLoading || classesLoading || facultyLoading || recordsLoading;

  // Aggregate Data
  const filteredCourses = courses?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const groupedCourses = depts?.map(dept => ({
    ...dept,
    courses: filteredCourses.filter(c => c.departmentId === dept.id)
  })).filter(group => group.courses.length > 0) || [];

  // Bulk Import Handler
  const handleImport = (data: any[]) => {
    data.forEach(item => {
      if (!item.code || !item.name) return;
      const id = `course-${item.code.toLowerCase().replace(/\s+/g, '-')}`;
      const courseRef = doc(firestore, 'colleges', collegeId, 'courses', id);
      
      setDocumentNonBlocking(courseRef, {
        ...item,
        id,
        credits: parseInt(item.credits || '4'),
        departmentId: isHOD ? myDeptId : item.departmentId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    
    toast({ title: 'Curriculum Synchronized', description: `Processing ${data.length} syllabus nodes.` });
  };

  // Single Creation Handler
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const targetDept = isHOD ? myDeptId : newDeptId;
    if (!targetDept) {
      toast({ variant: 'destructive', title: 'Action Required', description: 'Please select a department for this subject.' });
      return;
    }

    const id = `course-${newCode.toLowerCase().replace(/\s+/g, '-')}`;
    const courseRef = doc(firestore, 'colleges', collegeId, 'courses', id);

    setDocumentNonBlocking(courseRef, {
      id,
      code: newCode.toUpperCase(),
      name: newName,
      credits: parseInt(newCredits),
      departmentId: targetDept,
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Subject Provisioned', description: `${newCode} has been added to the master ledger.` });
    setIsAddOpen(false);
    setNewName(''); setNewCode(''); setNewCredits('4');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <div className="relative">
          <Loader2 className="animate-spin h-12 w-12 text-primary opacity-20" />
          <BookOpen className="h-5 w-5 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Aggregating Institutional Curriculum...</p>
      </div>
    );
  }

  // Summary Metrics
  const totalSubjects = courses?.length || 0;
  const totalCredits = courses?.reduce((acc, c) => acc + (c.credits || 0), 0) || 0;
  const totalHandlers = Array.from(new Set(classes?.flatMap(cls => Object.values(cls.subjectHandlers || {})) || [])).length;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 pt-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">
              {isHOD ? `${depts?.[0]?.name || 'Departmental'} Curriculum` : 'Curriculum Ledger'}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {isHOD ? 'Managing syllabus nodes and handler allotments for your division.' : 'Master catalog of all institutional courses and credit evaluations.'}
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <CsvImportDialog 
            title="Bulk Syllabus Import"
            description="Register entire curricula by uploading a formatted CSV."
            columns={COURSE_CSV_COLUMNS}
            onImport={handleImport}
          />
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-xl shadow-primary/20 rounded-full h-12 px-8 font-bold text-sm uppercase tracking-widest">
                <Plus className="h-5 w-5" /> Define Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card max-w-md p-0 overflow-hidden">
              <div className="h-2 w-full bg-primary" />
              <div className="p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-headline flex items-center gap-2">
                    <BookPlus className="h-6 w-6 text-primary" /> Register Subject
                  </DialogTitle>
                  <DialogDescription className="text-base">Define a new syllabus node in the curriculum architecture.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCourse} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Course Code</Label>
                    <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} required className="bg-muted border-none h-14 rounded-2xl text-lg px-6 font-mono uppercase" placeholder="e.g. CS-501" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject Title</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} required className="bg-muted border-none h-14 rounded-2xl text-lg px-6" placeholder="e.g. Machine Learning" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Academic Credits</Label>
                      <Input type="number" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} className="bg-muted border-none h-14 rounded-2xl px-6 font-bold" />
                    </div>
                    {!isHOD && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Division</Label>
                        <Select value={newDeptId} onValueChange={setNewDeptId}>
                          <SelectTrigger className="bg-muted border-none h-14 rounded-2xl px-6 font-bold"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                          <SelectContent>
                            {depts?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-16 font-bold uppercase tracking-widest shadow-xl shadow-primary/20 rounded-[1.5rem] mt-4 text-sm">
                    Commit to Syllabus
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <StatCard label="Total Subjects" value={totalSubjects} icon={BookOpen} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Curriculum Credits" value={totalCredits} icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Active Handlers" value={totalHandlers} icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
          <Input 
            placeholder="Search by code or subject title..." 
            className="pl-12 bg-card border-none shadow-sm h-14 rounded-2xl text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!isHOD && (
          <Button variant="outline" className="h-14 px-8 rounded-2xl gap-2 font-bold uppercase text-[10px] tracking-widest bg-card border-border">
            <Filter className="h-4 w-4" /> Global Filters
          </Button>
        )}
      </div>

      {/* Curriculum Grid */}
      <div className="space-y-16 px-4">
        {groupedCourses.map((group, idx) => (
          <motion.div 
            key={group.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white rounded-2xl shadow-sm border group-hover:bg-primary group-hover:text-white transition-all">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-headline font-bold text-foreground">{group.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] px-3">
                    {group.courses.length} Active Nodes
                  </Badge>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Dean: {group.headOfDept}</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <Card className="border-none shadow-sm bg-card overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50 border-b">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-bold py-6 pl-8 w-[140px] uppercase text-[10px] tracking-widest">Identity Key</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Syllabus Details</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Primary Handlers</TableHead>
                      <TableHead className="font-bold text-center uppercase text-[10px] tracking-widest">Attendance</TableHead>
                      <TableHead className="font-bold text-center uppercase text-[10px] tracking-widest">Performance</TableHead>
                      <TableHead className="text-right font-bold pr-8 uppercase text-[10px] tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.courses.map((course) => {
                      const relevantClasses = classes?.filter(cls => cls.subjectHandlers?.[course.id]) || [];
                      const handlerEmails = Array.from(new Set(relevantClasses.map(cls => cls.subjectHandlers?.[course.id]).filter(Boolean)));
                      const handlers = facultyMembers?.filter(f => handlerEmails.includes(f.email)) || [];
                      
                      const subjectRecords = records?.filter(r => r.subjectId === course.id) || [];
                      const avgAttendance = subjectRecords.length > 0 
                        ? Math.round(subjectRecords.reduce((acc, r) => acc + (r.attendance || 0), 0) / subjectRecords.length)
                        : 0;

                      return (
                        <TableRow key={course.id} className="group hover:bg-primary/[0.02] transition-colors border-border/50">
                          <TableCell className="py-7 pl-8">
                             <div className="flex flex-col">
                               <span className="font-mono font-bold text-primary text-sm uppercase tracking-tighter">{course.code}</span>
                               <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Verified Node</span>
                             </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">{course.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200 text-slate-500 h-5 px-1.5">
                                  {course.credits} Credits
                                </Badge>
                                {course.credits >= 4 && <Badge className="bg-amber-50 text-amber-700 border-none text-[8px] font-bold h-5 uppercase">Core Subject</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2.5">
                              {handlers.length > 0 ? (
                                handlers.slice(0, 3).map((h) => (
                                  <TooltipProvider key={h.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="h-9 w-9 rounded-xl border-2 border-background bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden cursor-help hover:-translate-y-1 transition-transform">
                                          {h.firstName?.[0]}{h.lastName?.[0]}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-900 text-white rounded-xl border-none">
                                        <p className="text-xs font-bold">Dr. {h.firstName} {h.lastName}</p>
                                        <p className="text-[10px] opacity-60">Verified Faculty</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))
                              ) : (
                                <Badge variant="ghost" className="bg-muted text-muted-foreground border-none font-bold uppercase text-[9px]">Pending Handler</Badge>
                              )}
                              {handlers.length > 3 && (
                                <div className="h-9 w-9 rounded-xl border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                  +{handlers.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={cn(
                                "text-xs font-bold",
                                avgAttendance > 0 && avgAttendance < 75 ? "text-red-500" : "text-emerald-600"
                              )}>{avgAttendance > 0 ? `${avgAttendance}%` : '--'}</span>
                              {avgAttendance > 0 && <Progress value={avgAttendance} className="h-1 w-16 bg-muted shadow-none" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-primary/5 text-primary border-none font-bold text-[8px] uppercase px-3 py-1">Optimized Hub</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                             <div className="flex justify-end gap-2">
                               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 text-primary transition-all">
                                 <Edit3 className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all">
                                 <ArrowUpRight className="h-4 w-4" />
                               </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {groupedCourses.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="py-40 text-center border-4 border-dashed rounded-[4rem] bg-muted/10 flex flex-col items-center gap-8"
          >
            <div className="relative">
              <LayoutGrid className="h-24 w-24 text-muted-foreground/10" strokeWidth={1} />
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-headline font-bold text-foreground">Curriculum Ledger Empty</p>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">Your academic syllabus hasn't been defined yet. Start by defining your first subject or use the bulk importer.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-full px-12 h-14 font-bold uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl shadow-primary/20">
              <Plus className="h-5 w-5" /> Initialize Curriculum
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden group">
      <CardContent className="p-7 flex items-center gap-5">
        <div className={cn("p-4 rounded-[1.5rem] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110", bg)}>
          <Icon className={cn("h-7 w-7", color)} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-tight mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
