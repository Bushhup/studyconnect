
'use client';

import { use, useState } from 'react';
import { 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  useUser 
} from '@/firebase';
import { doc, collection, query, where, documentId } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Loader2, Users, ClipboardCheck, 
  FileSpreadsheet, Award, TrendingUp, UserCheck,
  BookOpen, Star, AlertCircle, Search, Download
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

const collegeId = 'study-connect-college';

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Class
  const classRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId, 'classes', id), [firestore, id]);
  const { data: classData, isLoading: classLoading } = useDoc(classRef);

  // Fetch Department for Context
  const deptRef = useMemoFirebase(() => 
    classData?.departmentId ? doc(firestore, 'colleges', collegeId, 'departments', classData.departmentId) : null
  , [firestore, classData?.departmentId]);
  const { data: dept } = useDoc(deptRef);

  // Fetch Students in this class
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !classData) return null;
    return query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'student'), where('classId', '==', id));
  }, [firestore, classData, id]);
  const { data: students, isLoading: studentsLoading } = useCollection(studentsQuery);

  // Fetch Subjects for this department to map handlers
  const subjectsQuery = useMemoFirebase(() => 
    classData?.departmentId ? query(collection(firestore, 'colleges', collegeId, 'courses'), where('departmentId', '==', classData.departmentId)) : null
  , [firestore, classData?.departmentId]);
  const { data: subjects } = useCollection(subjectsQuery);

  // Fetch All Faculty to show handlers
  const facultyQuery = useMemoFirebase(() => 
    query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'faculty'))
  , [firestore]);
  const { data: faculty } = useCollection(facultyQuery);

  if (classLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading Class Portal...</p>
      </div>
    );
  }

  const filteredStudents = students?.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-card shadow-sm">
            <Link href={`/admin/departments/${classData?.departmentId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">{classData?.name}</h1>
            <p className="text-muted-foreground mt-1 font-body">
              {dept?.name} • Sem {classData?.semester}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-card rounded-full"><Download className="h-4 w-4" /> Export Roster</Button>
          <Button className="gap-2 rounded-full shadow-lg shadow-primary/20"><ClipboardCheck className="h-4 w-4" /> Attendance Registry</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Student Ledger */}
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
                          <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{student.firstName} {student.lastName}</p>
                            <p className="text-[9px] font-mono text-muted-foreground">ID: {student.id.slice(0, 8).toUpperCase()}</p>
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
                        <Badge className="bg-primary/5 text-primary border-none font-bold">O Grade</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="text-primary font-bold rounded-lg hover:bg-primary/5">
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

        <div className="space-y-8">
          {/* Subject Handlers & Performance */}
          <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Subject Handlers
              </CardTitle>
              <CardDescription className="text-white/60">Faculty performance within this section.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {subjects?.map(subject => {
                  const handlerId = classData?.subjectHandlers?.[subject.id];
                  const instructor = faculty?.find(f => f.id === handlerId);
                  
                  return (
                    <div key={subject.id} className="p-5 space-y-4 group hover:bg-muted/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-widest">{subject.code}</p>
                          <p className="font-bold text-foreground text-sm">{subject.name}</p>
                        </div>
                        <Badge variant="outline" className="border-border text-muted-foreground text-[9px] font-bold px-1.5 uppercase">Core</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-transparent group-hover:border-primary/10 transition-all">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border">
                          <AvatarFallback className="bg-white text-xs font-bold">
                            {instructor ? instructor.firstName?.[0] + instructor.lastName?.[0] : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{instructor ? `Dr. ${instructor.firstName} ${instructor.lastName}` : 'Not Assigned'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Success Rate: 92%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Rating</p>
                          <p className="text-xs font-bold text-primary">4.8 / 5.0</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section Summary */}
          <Card className="border-none shadow-sm bg-primary text-white rounded-[2rem] p-8 space-y-6 overflow-hidden relative">
            <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Section Insights</p>
              <h3 className="text-2xl font-headline font-bold">Performance Peak</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                This section is currently leading the department in <strong>Applied Mathematics</strong> with a 94.2% average score.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl">
                <p className="text-[10px] font-bold text-white/60 uppercase">Attendance</p>
                <p className="text-xl font-bold">96.4%</p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <p className="text-[10px] font-bold text-white/60 uppercase">Pass Rate</p>
                <p className="text-xl font-bold">100%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
