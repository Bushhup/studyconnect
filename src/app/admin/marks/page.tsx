'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, FileSpreadsheet, Download, Send, 
  TrendingUp, Trophy, Edit3, CheckCircle2,
  Building2, ChevronRight, ArrowLeft, Loader2,
  GraduationCap, Users, Award, ArrowUpRight, Info,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip as UiTooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { motion } from 'framer-motion';

const collegeId = 'study-connect-college';

const MARKS_CSV_COLUMNS: CsvColumn[] = [
  { key: 'studentId', label: 'Student ID', description: 'Unique institutional ID of the student.', example: 'alex.j@college.edu', required: true },
  { key: 'subjectId', label: 'Course ID', description: 'Reference ID of the course.', example: 'course-ai402', required: true },
  { key: 'cat1', label: 'CAT-1', description: 'Continuous Assessment 1 score.', example: '42', required: true },
  { key: 'cat2', label: 'CAT-2', description: 'Continuous Assessment 2 score.', example: '45', required: true },
  { key: 'final', label: 'Final Exam', description: 'Main semester exam score.', example: '94', required: false },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

function MarksContent() {
  const searchParams = useSearchParams();
  const initialDeptId = searchParams.get('deptId');
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  // User Profile for HOD Role Check
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);
  
  const isHOD = profile?.role === 'hod';
  const myDeptId = profile?.departmentId;

  // Navigation State
  const [viewState, setViewState] = useState<'depts' | 'classes' | 'students'>('depts');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(initialDeptId);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [deptsWithPerformance, setDeptsWithPerformance] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Data Fetching
  const deptsQuery = useMemoFirebase(() => {
    // Always fetch all departments so HODs can see the leaderboard/comparison
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore]);

  const classesQuery = useMemoFirebase(() => {
    const deptId = selectedDeptId || (isHOD ? myDeptId : null);
    if (!deptId) return null;
    // Security: HOD can only see classes in their department
    if (isHOD && deptId !== myDeptId) return null;
    return query(collection(firestore, 'colleges', collegeId, 'classes'), where('departmentId', '==', deptId));
  }, [firestore, selectedDeptId, isHOD, myDeptId]);
  
  const studentsQuery = useMemoFirebase(() => {
    if (!selectedClassId) return null;
    return query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'student'), where('classId', '==', selectedClassId));
  }, [firestore, selectedClassId]);

  const { data: departments, isLoading: deptsLoading } = useCollection(deptsQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: students, isLoading: studentsLoading } = useCollection(studentsQuery);

  // Initialize view based on URL params or Role
  useEffect(() => {
    if (initialDeptId && viewState === 'depts') {
      setSelectedDeptId(initialDeptId);
      setViewState('classes');
    }
  }, [initialDeptId, viewState]);

  // Generate Performance Data for Leaderboard
  useEffect(() => {
    if (departments && isMounted) {
      const withPerformance = departments.map(d => ({
        ...d,
        performanceScore: Math.floor(Math.random() * (98 - 75) + 75), 
        totalStudents: Math.floor(Math.random() * 500 + 100),
      })).sort((a, b) => b.performanceScore - a.performanceScore);
      setDeptsWithPerformance(withPerformance);
    }
  }, [departments, isMounted]);

  const handleExportTemplate = () => {
    const headers = MARKS_CSV_COLUMNS.map(c => c.key).join(',');
    const example = MARKS_CSV_COLUMNS.map(c => c.example).join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${example}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "academic_marks_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Template Exported', description: 'Follow the header format: ' + headers });
  };

  const handleDeptClick = (id: string) => {
    if (isHOD && id !== myDeptId) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You can only view detailed results for your own department.' });
      return;
    }
    setSelectedDeptId(id);
    setViewState('classes');
  };

  const handleClassClick = (id: string) => {
    setSelectedClassId(id);
    setViewState('students');
  };

  const handleBack = () => {
    if (viewState === 'students') {
      setViewState('classes');
      setSelectedClassId(null);
    } else if (viewState === 'classes') {
      setViewState('depts');
      setSelectedDeptId(null);
    }
  };

  const filteredStudents = students?.filter(s => 
    `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedDept = departments?.find(d => d.id === selectedDeptId);
  const selectedClass = classes?.find(c => c.id === selectedClassId);

  if (profileLoading) return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-1">
            {viewState !== 'depts' && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10 rounded-full bg-card shadow-sm border border-border">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Academic Performance</h1>
              <p className="text-muted-foreground font-body">
                {viewState === 'depts' && "Institutional leaderboard and departmental comparison."}
                {viewState === 'classes' && `Active sections and scores for ${selectedDept?.name}.`}
                {viewState === 'students' && `Student performance ledger for ${selectedClass?.name}.`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {viewState === 'students' && (
            <>
              <CsvImportDialog 
                title="Import Grade Ledger"
                description="Publish results for this section by uploading a CSV."
                columns={MARKS_CSV_COLUMNS}
              />
              <Button variant="outline" className="gap-2 shadow-sm rounded-full h-11 bg-card border-primary/10 text-primary font-bold" onClick={handleExportTemplate}>
                <Download className="h-4 w-4" /> Export Ledger
              </Button>
            </>
          )}
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-8 font-bold">
            <Send className="h-4 w-4" /> Broadcast Results
          </Button>
        </div>
      </div>

      {/* Leaderboard View (Visible to all Admins/HODs) */}
      {viewState === 'depts' && (
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-8">
              <div>
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary" /> Comparative Analytics
                </CardTitle>
                <CardDescription>Academic success rate across all divisions.</CardDescription>
              </div>
              <Badge className="bg-primary/5 text-primary border-none px-4 py-1 font-bold uppercase text-[10px]">Real-time Rankings</Badge>
            </CardHeader>
            <CardContent className="h-[300px] pt-8">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptsWithPerformance} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '600', fill: 'hsl(var(--foreground))' }} width={140} />
                    <Tooltip cursor={{fill: 'hsl(var(--primary) / 0.05)'}} />
                    <Bar dataKey="performanceScore" radius={[0, 8, 8, 0]} barSize={24} name="Success Score %">
                      {deptsWithPerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.id === myDeptId ? 'hsl(var(--primary))' : COLORS[index % COLORS.length]} 
                          opacity={entry.id === myDeptId ? 1 : 0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-muted/20 animate-pulse rounded-xl" />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Departmental Standings</h2>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{deptsWithPerformance.length} Divisions Ranked</span>
              </div>
              {deptsLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
              ) : (
                <div className="grid gap-4">
                  {deptsWithPerformance.map((dept, index) => (
                    <motion.div 
                      key={dept.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card rounded-2xl overflow-hidden",
                          dept.id === myDeptId && "ring-2 ring-primary ring-offset-4 ring-offset-background"
                        )} 
                        onClick={() => handleDeptClick(dept.id)}
                      >
                        <div className="flex items-center p-5 gap-6">
                          <div className={cn(
                            "flex flex-col items-center justify-center h-12 w-12 rounded-2xl font-bold text-lg shadow-sm",
                            index === 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground"
                          )}>
                            #{index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors truncate">{dept.name}</h3>
                              {dept.id === myDeptId && <Badge className="bg-primary text-white border-none font-bold text-[8px] uppercase">My Dept</Badge>}
                              {index === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                              <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {dept.totalStudents} Students</span>
                              <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> {dept.headOfDept}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground tracking-tighter">{dept.performanceScore}%</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Avg Index</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                        <Progress value={dept.performanceScore} className="h-1 rounded-none bg-muted" />
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-primary text-white rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
                <Trophy className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
                <div className="relative z-10 space-y-4">
                  <Badge className="bg-white/20 text-white border-none uppercase text-[9px] font-bold px-4 h-7 flex items-center w-fit rounded-full">Top Performer 2024</Badge>
                  <h3 className="text-3xl font-headline font-bold leading-tight">{deptsWithPerformance[0]?.name || 'Institutional Lead'}</h3>
                  <p className="text-sm text-white/70 leading-relaxed font-body">
                    Maintaining the highest academic standards with a consistent <strong>{deptsWithPerformance[0]?.performanceScore || 0}%</strong> average across all evaluation phases.
                  </p>
                </div>
                <Button className="w-full bg-white text-primary hover:bg-slate-100 font-bold rounded-2xl h-14 relative z-10 shadow-xl text-xs uppercase tracking-widest">
                  Generate Analytics Report
                </Button>
              </Card>

              <Card className="border-none shadow-sm bg-card rounded-[2rem] p-8 space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-muted rounded-2xl"><TrendingUp className="h-5 w-5 text-primary" /></div>
                   <div>
                     <p className="text-sm font-bold">Growth Trends</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Q4 Academic Update</p>
                   </div>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed">Institutional average performance has improved by 4.2% compared to the previous semester cycles.</p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Class-wise View */}
      {viewState === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classesLoading ? (
            <div className="col-span-full flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
          ) : (
            classes?.map((cls) => (
              <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card rounded-[2rem] overflow-hidden" onClick={() => handleClassClick(cls.id)}>
                <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase border-primary/20 text-primary bg-primary/5 px-3">SEM {cls.semester || 'N/A'}</Badge>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-xl font-headline mt-3 group-hover:text-primary transition-colors">{cls.name}</CardTitle>
                  <CardDescription className="text-xs font-medium">Allotted section results.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Performance Avg</span>
                      <span className="text-foreground">88.4%</span>
                    </div>
                    <Progress value={88} className="h-1 bg-muted shadow-none" />
                  </div>
                  <div className="pt-4 border-t border-dashed flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{cls.studentIds?.length || 0}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Enrollment</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="font-bold text-primary text-[10px] uppercase rounded-xl hover:bg-primary/5">Analyze Ledger</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {classes?.length === 0 && !classesLoading && (
            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
              <p className="font-bold text-muted-foreground">No sections registered in this department.</p>
            </div>
          )}
        </div>
      )}

      {/* Student Ledger View */}
      {viewState === 'students' && (
        <Card className="border-none shadow-sm bg-card overflow-hidden rounded-[2.5rem]">
          <CardHeader className="border-b pb-8 px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter roster by name or email..." 
                  className="pl-12 bg-muted border-none h-12 rounded-2xl shadow-none focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-primary/20 text-primary font-bold px-6 py-2.5 uppercase rounded-full bg-primary/5 tracking-widest text-[10px]">
                  {selectedClass?.name}
                </Badge>
                <div className="h-10 w-px bg-border hidden sm:block" />
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Section Avg</p>
                  <p className="text-lg font-bold text-primary">88.4%</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {studentsLoading ? (
              <div className="flex justify-center p-40"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-bold pl-8 py-5 text-foreground uppercase text-[10px] tracking-widest">Student Identity</TableHead>
                    <TableHead className="font-bold text-center text-foreground uppercase text-[10px] tracking-widest">CAT-1</TableHead>
                    <TableHead className="font-bold text-center text-foreground uppercase text-[10px] tracking-widest">CAT-2</TableHead>
                    <TableHead className="font-bold text-center text-foreground uppercase text-[10px] tracking-widest">Final Rank</TableHead>
                    <TableHead className="text-right pr-8 font-bold text-foreground uppercase text-[10px] tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-primary/[0.02] border-border transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary text-sm uppercase shadow-inner">
                            {student.firstName?.[0] || 'S'}{student.lastName?.[0] || 'T'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-base">{student.firstName} {student.lastName}</span>
                            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">42 / 50</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">45 / 50</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="font-bold text-foreground text-sm">92%</span>
                          <Progress value={92} className="h-1 w-16 bg-muted shadow-none" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary rounded-xl h-10 px-4 hover:bg-primary/10 transition-all" onClick={() => {setSelectedStudent(student); setIsMarkDialogOpen(true);}}>
                          <Edit3 className="h-4 w-4" /> Edit Record
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-32 text-muted-foreground italic bg-muted/5 font-body">No student records matching criteria found in this section.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Marks Dialog */}
      <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
        <DialogContent className="rounded-[2.5rem] bg-card border-none shadow-2xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-headline">
              <Award className="h-6 w-6 text-primary" /> Modify Results
            </DialogTitle>
            <DialogDescription className="text-base">Assign or update academic scores for {selectedStudent?.firstName} {selectedStudent?.lastName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Assessment Phase</Label>
              <Select defaultValue="cat1">
                <SelectTrigger className="bg-muted border-none shadow-none rounded-2xl h-14 px-6 text-base font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat1">CAT-1 Assessment (Max 50)</SelectItem>
                  <SelectItem value="cat2">CAT-2 Assessment (Max 50)</SelectItem>
                  <SelectItem value="model">Model Examination (Max 100)</SelectItem>
                  <SelectItem value="final">Final University Exam (Max 100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Score Obtained</Label>
                <Input type="number" placeholder="0" className="bg-muted border-none shadow-none h-14 rounded-2xl px-6 text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Max Ceiling</Label>
                <Input type="number" defaultValue="100" className="bg-muted border-none shadow-none h-14 rounded-2xl px-6 text-lg font-bold opacity-60" />
              </div>
            </div>
            <Button className="w-full h-16 font-bold shadow-xl shadow-primary/20 mt-4 rounded-2xl text-base uppercase tracking-widest" onClick={() => {toast({ title: 'Record Synchronized', description: 'Results have been updated in the institutional cloud.' }); setIsMarkDialogOpen(false);}}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Finalize Result Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MarksManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary" /></div>}>
      <MarksContent />
    </Suspense>
  );
}
