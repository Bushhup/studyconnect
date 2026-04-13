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
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Loader2, ClipboardCheck, 
  UserCheck, Search, Download, TrendingUp,
  Calendar, Clock, MapPin, Edit3, Save, Plus, Trash2, Users
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:15 AM - 12:15 PM',
  '12:15 PM - 01:15 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM'
];

export default function ClassViewClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);

  // Fetch Class
  const classRef = useMemoFirebase(() => id ? doc(firestore, 'colleges', collegeId, 'classes', id) : null, [firestore, id]);
  const { data: classData, isLoading: classLoading } = useDoc(classRef);

  // Fetch Department for Context
  const deptRef = useMemoFirebase(() => 
    classData?.departmentId ? doc(firestore, 'colleges', collegeId, 'departments', classData.departmentId) : null
  , [firestore, classData?.departmentId]);
  const { data: dept } = useDoc(deptRef);

  // Fetch Students
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !classData || !id) return null;
    return query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'student'), where('classId', '==', id));
  }, [firestore, classData, id]);
  const { data: students, isLoading: studentsLoading } = useCollection(studentsQuery);

  // Fetch Subjects
  const subjectsQuery = useMemoFirebase(() => 
    classData?.departmentId ? query(collection(firestore, 'colleges', collegeId, 'courses'), where('departmentId', '==', classData.departmentId)) : null
  , [firestore, classData?.departmentId]);
  const { data: subjects } = useCollection(subjectsQuery);

  // Fetch All Faculty
  const facultyQuery = useMemoFirebase(() => 
    query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'faculty'))
  , [firestore]);
  const { data: faculty } = useCollection(facultyQuery);

  if (!id) return <div className="p-20 text-center">Invalid Class Reference</div>;

  if (classLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading Class Portal...</p>
      </div>
    );
  }

  const handleUpdateTimetable = (day: string, slot: string, subjectId: string) => {
    if (!classRef) return;
    const currentTimetable = classData?.timetable || {};
    const updatedTimetable = {
      ...currentTimetable,
      [day]: {
        ...(currentTimetable[day] || {}),
        [slot]: subjectId
      }
    };

    updateDocumentNonBlocking(classRef, { timetable: updatedTimetable });
  };

  const filteredStudents = students?.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm">
            <Link href={`/admin/department-portal?id=${classData?.departmentId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{classData?.name}</h1>
            <p className="text-muted-foreground mt-1 font-body">
              {dept?.name} • Semester {classData?.semester}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-card rounded-full shadow-sm"><Download className="h-4 w-4" /> Export Roster</Button>
          <Button className="gap-2 rounded-full shadow-lg shadow-primary/20"><ClipboardCheck className="h-4 w-4" /> Attendance Registry</Button>
        </div>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="bg-card border h-14 p-1.5 rounded-2xl mb-8 flex justify-start overflow-x-auto w-fit">
          <TabsTrigger value="roster" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="h-4 w-4" /> Student Roster
          </TabsTrigger>
          <TabsTrigger value="timetable" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calendar className="h-4 w-4" /> Class Timetable
          </TabsTrigger>
          <TabsTrigger value="handlers" className="gap-2 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
            <UserCheck className="h-4 w-4" /> Subject Handlers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b pb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <CardTitle className="text-lg font-headline">Student Performance Ledger</CardTitle>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Filter roster..." 
                        className="pl-10 bg-muted border-none h-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="font-bold pl-6 py-4 text-foreground">Student Identity</TableHead>
                        <TableHead className="font-bold text-center text-foreground">Attendance</TableHead>
                        <TableHead className="font-bold text-center text-foreground">Avg Grade</TableHead>
                        <TableHead className="text-right pr-6 font-bold text-foreground">Analytics</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="group hover:bg-muted/30 border-border">
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs uppercase">
                                {student.firstName?.[0]}{student.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{student.firstName} {student.lastName}</p>
                                <p className="text-[9px] font-mono text-muted-foreground uppercase">ID: {student.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-bold text-emerald-600">{student.attendanceRate || 94}%</span>
                              <Progress value={student.attendanceRate || 94} className="h-1 w-12" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px]">Grade O</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="sm" className="text-primary font-bold rounded-lg hover:bg-primary/5 text-[10px] uppercase">
                              View Results
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">No students assigned to this section.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-primary text-white rounded-[2rem] p-8 space-y-6 overflow-hidden relative">
                <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
                <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Section Insights</p>
                  <h3 className="text-2xl font-headline font-bold">Performance Peak</h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    This section is currently leading the department in average scores.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-white/60 uppercase">Attendance</p>
                    <p className="text-xl font-bold">96.4%</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-white/60 uppercase">Pass Rate</p>
                    <p className="text-xl font-bold">100%</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timetable">
          <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                <CardDescription>Official class timings and subject mapping.</CardDescription>
              </div>
              <Button 
                variant={isEditingTimetable ? "default" : "outline"} 
                size="sm" 
                className="rounded-xl gap-2 font-bold uppercase text-[10px]"
                onClick={() => {
                  if(isEditingTimetable) toast({ title: 'Schedule Finalized', description: 'Class timetable has been synchronized.' });
                  setIsEditingTimetable(!isEditingTimetable);
                }}
              >
                {isEditingTimetable ? <><Save className="h-3 w-3" /> Save Changes</> : <><Edit3 className="h-3 w-3" /> Edit Timetable</>}
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-none">
                    <TableHead className="w-[150px] font-bold text-center border-r">Time Slot</TableHead>
                    {DAYS.map(day => <TableHead key={day} className="text-center font-bold">{day}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TIME_SLOTS.map(slot => (
                    <TableRow key={slot} className="border-border">
                      <TableCell className="font-bold text-[10px] text-muted-foreground uppercase text-center border-r bg-muted/10">
                        {slot}
                      </TableCell>
                      {DAYS.map(day => {
                        const subjectId = classData?.timetable?.[day]?.[slot];
                        const subject = subjects?.find(s => s.id === subjectId);
                        
                        return (
                          <TableCell key={day} className="p-2">
                            {isEditingTimetable ? (
                              <Select 
                                value={subjectId || "empty"} 
                                onValueChange={(val) => handleUpdateTimetable(day, slot, val)}
                              >
                                <SelectTrigger className="h-10 text-[9px] font-bold border-none bg-muted/50 hover:bg-muted transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="empty">Break / Free</SelectItem>
                                  {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.code}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              subject ? (
                                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center space-y-1">
                                  <p className="text-[10px] font-bold text-primary uppercase">{subject.code}</p>
                                  <p className="text-[8px] text-muted-foreground font-medium truncate">{subject.name}</p>
                                </div>
                              ) : (
                                <div className="h-10 rounded-xl border border-dashed border-border flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-30">Break</span>
                                </div>
                              )
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

        <TabsContent value="handlers">
          <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Faculty Allocation
              </CardTitle>
              <CardDescription className="text-white/60">Manage faculty responsible for each subject in this section.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {subjects?.map(subject => {
                  const handlerId = classData?.subjectHandlers?.[subject.id];
                  const instructor = faculty?.find(f => f.id === handlerId);
                  
                  return (
                    <div key={subject.id} className="p-6 space-y-4 group hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">{subject.code}</p>
                        <p className="font-bold text-foreground text-sm">{subject.name}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Select 
                          value={handlerId || "unassigned"}
                          onValueChange={(val) => {
                            const handlers = classData?.subjectHandlers || {};
                            updateDocumentNonBlocking(classRef!, { subjectHandlers: { ...handlers, [subject.id]: val } });
                            toast({ title: 'Handler Assigned', description: `Instructor updated for ${subject.code}.` });
                          }}
                        >
                          <SelectTrigger className="w-[240px] bg-muted/50 border-none rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Not Assigned</SelectItem>
                            {faculty?.map(f => (
                              <SelectItem key={f.id} value={f.id}>Dr. {f.firstName} {f.lastName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {instructor && (
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Handler Rating</p>
                            <p className="text-xs font-bold text-primary">4.8 / 5.0</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
