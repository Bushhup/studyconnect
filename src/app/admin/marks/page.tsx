'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
  GraduationCap, Users, Award, ArrowUpRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const collegeId = 'study-connect-college';

const MARKS_CSV_COLUMNS: CsvColumn[] = [
  { key: 'studentId', label: 'Student ID', description: 'Unique institutional ID of the student.', example: 'S-101', required: true },
  { key: 'subject', label: 'Subject Name', description: 'Course name or code.', example: 'Machine Learning', required: true },
  { key: 'cat1', label: 'CAT-1', description: 'Continuous Assessment 1 score.', example: '42', required: true },
  { key: 'cat2', label: 'CAT-2', description: 'Continuous Assessment 2 score.', example: '45', required: true },
  { key: 'final', label: 'Final Exam', description: 'Main semester exam score.', example: '94', required: false },
];

export default function MarksManagementPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  // Navigation State
  const [viewState, setViewState] = useState<'depts' | 'classes' | 'students'>('depts');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Data Fetching
  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  const classesQuery = useMemoFirebase(() => {
    if (!selectedDeptId) return null;
    return query(collection(firestore, 'colleges', collegeId, 'classes'), where('departmentId', '==', selectedDeptId));
  }, [firestore, selectedDeptId]);
  
  const studentsQuery = useMemoFirebase(() => {
    if (!selectedClassId) return null;
    return query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'student'), where('classId', '==', selectedClassId));
  }, [firestore, selectedClassId]);

  const { data: departments, isLoading: deptsLoading } = useCollection(deptsQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: students, isLoading: studentsLoading } = useCollection(studentsQuery);

  // Aggregation Logic (Mocked performance for sorting)
  const departmentsWithPerformance = departments?.map(d => ({
    ...d,
    performanceScore: Math.floor(Math.random() * (98 - 75) + 75), // Mocked for prototype sorting
    totalStudents: Math.floor(Math.random() * 500 + 100),
  })).sort((a, b) => b.performanceScore - a.performanceScore) || [];

  const handleDeptClick = (id: string) => {
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
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedDept = departments?.find(d => d.id === selectedDeptId);
  const selectedClass = classes?.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {viewState !== 'depts' && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 rounded-full bg-muted">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Academic Results</h1>
          </div>
          <p className="text-muted-foreground font-body">
            {viewState === 'depts' && "Institutional performance leaderboard by department."}
            {viewState === 'classes' && `Class-wise results for ${selectedDept?.name}.`}
            {viewState === 'students' && `Student marks ledger for ${selectedClass?.name}.`}
          </p>
        </div>
        <div className="flex gap-2">
          {viewState === 'students' && (
            <>
              <CsvImportDialog 
                title="Import Grade Ledger"
                description="Publish results for this section by uploading a CSV with student scores."
                columns={MARKS_CSV_COLUMNS}
              />
              <Button variant="outline" className="gap-2 shadow-sm rounded-full h-11 bg-card">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </>
          )}
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
            <Send className="h-4 w-4" /> Global Portal
          </Button>
        </div>
      </div>

      {/* Leaderboard View */}
      {viewState === 'depts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {deptsLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : (
              <div className="grid gap-4">
                {departmentsWithPerformance.map((dept, index) => (
                  <Card key={dept.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card rounded-2xl overflow-hidden" onClick={() => handleDeptClick(dept.id)}>
                    <div className="flex items-center p-6 gap-6">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-primary/5 text-primary font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-headline font-bold text-xl group-hover:text-primary transition-colors">{dept.name}</h3>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px]">RANKED</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {dept.totalStudents} Students</span>
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> HOD: {dept.headOfDept}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{dept.performanceScore}%</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Performance</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <Progress value={dept.performanceScore} className="h-1 rounded-none bg-muted" />
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-white rounded-[2rem] p-8 space-y-6 overflow-hidden relative">
              <Trophy className="absolute right-[-20px] bottom-[-20px] h-40 w-40 text-white/5 -rotate-12" />
              <div className="relative z-10 space-y-2">
                <Badge className="bg-white/20 text-white border-none uppercase text-[9px] font-bold px-3">Top Performer</Badge>
                <h3 className="text-2xl font-headline font-bold">{departmentsWithPerformance[0]?.name || 'Fetching...'}</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Leading the institution with a consistent <strong>{departmentsWithPerformance[0]?.performanceScore || 0}%</strong> average score across all semesters.
                </p>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-slate-100 font-bold rounded-xl h-12 relative z-10 shadow-lg">
                View Detailed Analytics
              </Button>
            </Card>

            <Card className="border-none shadow-sm bg-card rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Institutional Momentum</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground">+4.2% Growth</p>
                    <p className="text-[10px] text-muted-foreground">Institution average compared to last year.</p>
                  </div>
                </div>
              </div>
            </Card>
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
              <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card rounded-2xl overflow-hidden" onClick={() => handleClassClick(cls.id)}>
                <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter border-primary/20 text-primary">SEM {cls.semester || 'N/A'}</Badge>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-xl font-headline mt-2">{cls.name}</CardTitle>
                  <CardDescription>Section Management Portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Performance Avg</span>
                    <span className="text-foreground">88.4%</span>
                  </div>
                  <Progress value={88} className="h-1" />
                  <div className="pt-4 border-t border-dashed flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold">45 Students</span>
                    </div>
                    <Button variant="ghost" size="sm" className="font-bold text-primary text-[10px] uppercase">Review Ledger</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {classes?.length === 0 && !classesLoading && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
              <p className="font-bold text-muted-foreground">No sections registered in this department.</p>
            </div>
          )}
        </div>
      )}

      {/* Student Ledger View */}
      {viewState === 'students' && (
        <Card className="border-none shadow-sm bg-card overflow-hidden rounded-[2rem]">
          <CardHeader className="border-b pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter student roster..." 
                  className="pl-10 bg-muted border-none h-11 rounded-xl shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-slate-200 text-muted-foreground font-bold px-4 py-1.5 uppercase rounded-full">
                  {selectedClass?.name}
                </Badge>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Section Avg</p>
                  <p className="text-sm font-bold text-primary">88.4%</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {studentsLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-bold pl-6 py-4">Student Identity</TableHead>
                    <TableHead className="font-bold text-center">Current Sem</TableHead>
                    <TableHead className="font-bold text-center">Avg Score</TableHead>
                    <TableHead className="font-bold">Final Grade</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-muted/30 border-border transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs uppercase">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{student.firstName} {student.lastName}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">ID: {student.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">5</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-foreground">92%</span>
                          <Progress value={92} className="h-1 w-12" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="font-bold border-none px-3 bg-emerald-500/10 text-emerald-600">Grade O</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary rounded-lg hover:bg-primary/5" onClick={() => {setSelectedStudent(student); setIsMarkDialogOpen(true);}}>
                          <Edit3 className="h-4 w-4" /> Edit Result
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic bg-muted/5">No student records found in this section.</TableCell>
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
        <DialogContent className="rounded-[2rem] bg-card border-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Edit Academic Result
            </DialogTitle>
            <DialogDescription>Assign marks for {selectedStudent?.firstName} {selectedStudent?.lastName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Exam Phase</Label>
              <Select defaultValue="cat1">
                <SelectTrigger className="bg-muted border-none shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat1">CAT-1 Assessment</SelectItem>
                  <SelectItem value="cat2">CAT-2 Assessment</SelectItem>
                  <SelectItem value="model">Model Examination</SelectItem>
                  <SelectItem value="final">Final University Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marks Obtained</Label>
                <Input type="number" placeholder="0" className="bg-muted border-none shadow-none h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Max Marks</Label>
                <Input type="number" defaultValue="100" className="bg-muted border-none shadow-none h-11" />
              </div>
            </div>
            <Button className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2" onClick={() => {toast({ title: 'Record Updated', description: 'Results have been synchronized with the student portal.' }); setIsMarkDialogOpen(false);}}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Finalize Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
