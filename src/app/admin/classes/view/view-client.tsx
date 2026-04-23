'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  useUser,
  updateDocumentNonBlocking
} from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Loader2, ClipboardCheck, 
  UserCheck, Search, Download, TrendingUp,
  Calendar, Clock, Edit3, Save, Users, Trash2, BookPlus, Info
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:15 AM - 12:15 PM', '01:30 PM - 02:30 PM', '02:30 PM - 03:30 PM'];

const ROSTER_COLUMNS = ['firstName', 'lastName', 'email', 'status', 'enrollmentDate'];

export default function ClassViewClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);

  // Data lookups
  const classRef = useMemoFirebase(() => id ? doc(firestore, 'colleges', collegeId, 'classes', id) : null, [firestore, id]);
  const { data: classData, isLoading: classLoading } = useDoc(classRef);

  const deptRef = useMemoFirebase(() => classData?.departmentId ? doc(firestore, 'colleges', collegeId, 'departments', classData.departmentId) : null, [firestore, classData?.departmentId]);
  const { data: dept } = useDoc(deptRef);

  const studentsQuery = useMemoFirebase(() => id ? query(collection(firestore, 'colleges', collegeId, 'users'), where('classId', '==', id)) : null, [firestore, id]);
  const { data: students, isLoading: studentsLoading } = useCollection(studentsQuery);

  const coursesQuery = useMemoFirebase(() => classData?.departmentId ? query(collection(firestore, 'colleges', collegeId, 'courses'), where('departmentId', '==', classData.departmentId)) : null, [firestore, classData?.departmentId]);
  const { data: courses } = useCollection(coursesQuery);

  const facultyQuery = useMemoFirebase(() => query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'faculty')), [firestore]);
  const { data: facultyMembers } = useCollection(facultyQuery);

  if (!id) return <div className="p-20 text-center font-bold text-muted-foreground uppercase italic tracking-widest">Section Node Missing</div>;

  if (classLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Section Data...</p>
      </div>
    );
  }

  const handleUpdateTimetable = (day: string, slot: string, courseId: string) => {
    if (!classRef) return;
    const timetable = classData?.timetable || {};
    const updated = { ...timetable, [day]: { ...(timetable[day] || {}), [slot]: courseId } };
    updateDocumentNonBlocking(classRef, { timetable: updated });
  };

  const handleAssignHandler = (courseId: string, facultyEmail: string) => {
    if (!classRef) return;
    const handlers = classData?.subjectHandlers || {};
    updateDocumentNonBlocking(classRef, { subjectHandlers: { ...handlers, [courseId]: facultyEmail } });
    toast({ title: 'Handler Mapped', description: `Instructor updated for institutional syllabus node.` });
  };

  const downloadRosterTemplate = () => {
    const csvContent = `data:text/csv;charset=utf-8,${ROSTER_COLUMNS.join(',')}\nJohn,Doe,john.d@college.edu,active,2024-01-15`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `roster_${classData?.name || 'class'}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Template Exported', description: 'Headers: ' + ROSTER_COLUMNS.join(', ') });
  };

  const filteredStudents = students?.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm hover:bg-primary/5 transition-colors">
            <Link href={`/admin/department-portal?id=${classData?.departmentId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{classData?.name}</h1>
            <p className="text-muted-foreground mt-1 font-body">
              {dept?.name} • Semester {classData?.semester} • {students?.length || 0} Students
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2 bg-card rounded-full shadow-sm" onClick={downloadRosterTemplate}>
                  <Download className="h-4 w-4" /> Export Roster
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white rounded-xl p-3 max-w-xs">
                <p className="text-[10px] font-bold uppercase mb-1">Required Headers</p>
                <code className="text-[9px] break-all">{ROSTER_COLUMNS.join(', ')}</code>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 h-11 px-8 font-bold" asChild>
             <Link href="/admin/attendance"><ClipboardCheck className="h-4 w-4" /> Presence Hub</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="bg-card border h-14 p-1.5 rounded-2xl mb-8 flex justify-start overflow-x-auto w-fit">
          <TabsTrigger value="roster" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"><Users className="h-4 w-4" /> Student Roster</TabsTrigger>
          <TabsTrigger value="timetable" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"><Calendar className="h-4 w-4" /> Weekly Schedule</TabsTrigger>
          <TabsTrigger value="handlers" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"><UserCheck className="h-4 w-4" /> Syllabus Assignment</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="roster" key="tab-roster">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                  <CardHeader className="border-b pb-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-headline">Section Ledger</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Filter records..." className="pl-10 bg-muted border-none h-11 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="pl-6 py-4 font-bold text-foreground">Identity</TableHead>
                          <TableHead className="font-bold text-center">Attendance</TableHead>
                          <TableHead className="font-bold text-center">Performance</TableHead>
                          <TableHead className="text-right pr-6 font-bold">Portal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((s) => (
                          <TableRow key={s.id} className="group hover:bg-muted/30 border-border">
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">{s.firstName?.[0]}{s.lastName?.[0]}</AvatarFallback></Avatar>
                                <div>
                                  <p className="font-bold text-sm">{s.firstName} {s.lastName}</p>
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{s.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-emerald-600">92%</span>
                                <Progress value={92} className="h-1 w-12" />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-primary/5 text-primary border-none font-bold uppercase text-[8px] px-2">Index: 3.8</Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="ghost" size="sm" className="text-primary font-bold rounded-xl h-8 text-[9px] uppercase hover:bg-primary/5" asChild>
                                <Link href={`/admin/students?search=${s.email}`}>Deep Dive</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm bg-primary text-white rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                  <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
                  <div className="relative z-10 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Section Insights</p>
                    <h3 className="text-2xl font-headline font-bold leading-tight">Performance Momentum High</h3>
                    <p className="text-xs text-white/70 leading-relaxed">This cohort is currently leading the department with a 92.4% average attendance rate.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-3 bg-white/10 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Pass Rate</p>
                      <p className="text-xl font-bold">100%</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Unit Avg</p>
                      <p className="text-xl font-bold">88.4</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timetable" key="tab-timetable">
            <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Class Schedule Architecture</CardTitle>
                  <CardDescription>Assign syllabus nodes to official institutional time slots.</CardDescription>
                </div>
                <Button 
                  variant={isEditingTimetable ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-xl gap-2 font-bold uppercase text-[10px]"
                  onClick={() => setIsEditingTimetable(!isEditingTimetable)}
                >
                  {isEditingTimetable ? <><Save className="h-3 w-3" /> Lock Schedule</> : <><Edit3 className="h-3 w-3" /> Edit Timetable</>}
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-none">
                      <TableHead className="w-[180px] font-bold text-center border-r">Session Slot</TableHead>
                      {DAYS.map(day => <TableHead key={`head-${day}`} className="text-center font-bold">{day}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TIME_SLOTS.map(slot => (
                      <TableRow key={`row-${slot}`} className="border-border">
                        <TableCell className="font-bold text-[10px] text-muted-foreground uppercase text-center border-r bg-muted/10 h-20">
                          {slot}
                        </TableCell>
                        {DAYS.map(day => {
                          const courseId = classData?.timetable?.[day]?.[slot];
                          const course = courses?.find(c => c.id === courseId);
                          return (
                            <TableCell key={`cell-${day}-${slot}`} className="p-2 border-r last:border-r-0">
                              {isEditingTimetable ? (
                                <Select value={courseId || "empty"} onValueChange={(val) => handleUpdateTimetable(day, slot, val)}>
                                  <SelectTrigger className="h-12 border-none bg-muted/50 font-bold text-[9px] uppercase"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="empty">Break / Recess</SelectItem>
                                    {courses?.map(c => <SelectItem key={`opt-${c.id}`} value={c.id}>{c.code}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className={cn("h-14 flex flex-col items-center justify-center p-2 rounded-xl transition-all", course ? "bg-primary/5 border border-primary/10" : "border border-dashed opacity-40")}>
                                  <p className="text-[10px] font-bold text-primary uppercase truncate w-full text-center">{course?.code || '---'}</p>
                                  <p className="text-[8px] font-bold text-muted-foreground uppercase truncate w-full text-center mt-0.5">{course?.name || 'Recess'}</p>
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="handlers" key="tab-handlers">
            <div className="grid gap-6">
              <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                <CardHeader className="bg-slate-900 text-white pb-8">
                  <CardTitle className="text-lg font-headline flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /> Faculty Allocation Ledger</CardTitle>
                  <CardDescription className="text-white/50">Delegate instructional responsibility for each syllabus node in this section.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 -mt-6">
                  <div className="bg-card mx-6 rounded-2xl shadow-xl border overflow-hidden">
                    <div className="divide-y">
                      {courses?.map(course => {
                        const handlerEmail = classData?.subjectHandlers?.[course.id];
                        const faculty = facultyMembers?.find(f => f.email === handlerEmail);
                        return (
                          <div key={`handler-${course.id}`} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/30 transition-all">
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-[8px] font-bold uppercase border-primary/20 text-primary">{course.code}</Badge>
                              <p className="font-bold text-foreground text-base leading-tight">{course.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Select value={handlerEmail || "unassigned"} onValueChange={(val) => handleAssignHandler(course.id, val)}>
                                <SelectTrigger className="w-[280px] bg-muted/50 border-none h-12 rounded-xl text-xs font-bold"><SelectValue placeholder="Assign Instructor" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Not Assigned (TBD)</SelectItem>
                                  {facultyMembers?.map(f => (
                                    <SelectItem key={`fac-${f.id}`} value={f.email}>Dr. {f.firstName} {f.lastName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {faculty && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Handler Rating</p>
                                  <p className="text-xs font-bold text-emerald-600">4.8 / 5.0</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}