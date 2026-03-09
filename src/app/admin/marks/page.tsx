
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, FileSpreadsheet, Download, Send, 
  AlertCircle, Loader2, TrendingUp, Trophy,
  Star, ChevronRight, Edit3, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const collegeId = 'study-connect-college';

const chartData = [
  { name: 'CAT-1', avg: 72 },
  { name: 'CAT-2', avg: 78 },
  { name: 'Model', avg: 82 },
  { name: 'Final', avg: 88 },
];

export default function MarksManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark states
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [modelExam, setModelExam] = useState('');
  const [finalSemester, setFinalSemester] = useState('');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const students = users?.filter(u => 
    u.role === 'student' && 
    (`${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openMarkDialog = (student: any) => {
    setSelectedStudent(student);
    const existingMarks = student.marks?.[`sem${selectedSemester}`] || {};
    setCat1(existingMarks.cat1 || '');
    setCat2(existingMarks.cat2 || '');
    setModelExam(existingMarks.model || '');
    setFinalSemester(existingMarks.final || '');
    setIsMarkDialogOpen(true);
  };

  const handleSemesterChange = (sem: string) => {
    setSelectedSemester(sem);
    if (selectedStudent) {
      const existingMarks = selectedStudent.marks?.[`sem${sem}`] || {};
      setCat1(existingMarks.cat1 || '');
      setCat2(existingMarks.cat2 || '');
      setModelExam(existingMarks.model || '');
      setFinalSemester(existingMarks.final || '');
    }
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSubmitting(true);
    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedStudent.id);
    
    const semKey = `sem${selectedSemester}`;
    const newMarks = {
      cat1: parseInt(cat1) || 0,
      cat2: parseInt(cat2) || 0,
      model: parseInt(modelExam) || 0,
      final: parseInt(finalSemester) || 0,
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(userRef, {
      marks: {
        [semKey]: newMarks
      }
    }, { merge: true });

    toast({ 
      title: 'Academic Record Updated', 
      description: `Semester ${selectedSemester} results for ${selectedStudent.firstName} have been synchronized.` 
    });

    setIsSubmitting(false);
    setIsMarkDialogOpen(false);
  };

  const getAvailableSemesters = (degreeType: string = 'UG') => {
    const count = degreeType === 'PG' ? 4 : 6;
    return Array.from({ length: count }, (_, i) => (i + 1).toString());
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Grading</h1>
          <p className="text-muted-foreground mt-1">Manage CATs, Model Exams, and Final Semester results across academic years.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm rounded-full" onClick={() => toast({ title: "Export Started", description: "Generating grade report..." })}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full px-6" onClick={() => toast({ title: "Portal Sync", description: "Grades published to all student portals." })}>
            <Send className="h-4 w-4" /> Publish Results
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-headline">Assessment Progression</CardTitle>
              <CardDescription>Institutional averages for current Semester 4</CardDescription>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold gap-1.5 py-1">
              <TrendingUp className="h-3 w-3" /> +5.2% Growth
            </Badge>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
            <Trophy className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12" />
            <CardHeader className="pb-2">
               <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest">Top Scorer</CardDescription>
               <CardTitle className="text-2xl">Sarah Miller</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-2 text-3xl font-bold">
                 98.4 <span className="text-sm font-medium text-white/70">GPA 4.0</span>
               </div>
               <p className="text-[10px] text-white/60 mt-2 font-medium">Rank #1 • UG (6 Sems)</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">System Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>UG (6 Semesters)</span>
                  <span className="text-slate-400">75%</span>
                </div>
                <Progress value={75} className="h-1 bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>PG (4 Semesters)</span>
                  <span className="text-slate-400">25%</span>
                </div>
                <Progress value={25} className="h-1 bg-slate-100" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by student name or ID..." 
                className="pl-10 bg-slate-50 border-none h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3 py-1 uppercase">
                 Academic Year 2024-25
               </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-bold pl-6 py-4">Student Name</TableHead>
                <TableHead className="font-bold">Degree / Program</TableHead>
                <TableHead className="font-bold text-center">Current Sem</TableHead>
                <TableHead className="font-bold text-center">Avg Score</TableHead>
                <TableHead className="font-bold">Grade</TableHead>
                <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : students?.map((student, idx) => {
                // Calculation logic for current sem display
                const deg = student.degreeType || 'UG';
                const marksData = student.marks?.[`sem${selectedSemester}`] || {};
                const avg = marksData.final ? Math.round((marksData.cat1 + marksData.cat2 + marksData.model + marksData.final) / 4) : 0;
                const displayScore = avg || (80 - idx);
                const grade = displayScore > 90 ? 'O' : displayScore > 80 ? 'A+' : displayScore > 70 ? 'A' : 'B';
                
                return (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 border-slate-100 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                        <span className="text-[10px] font-mono text-slate-400">#{student.id.substring(0, 6).toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold">
                         {deg} Program
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-600">
                      Sem {selectedSemester}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold">{displayScore}%</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-bold px-3 py-0.5 border-none",
                        grade === 'O' ? "bg-emerald-100 text-emerald-700" :
                        grade === 'A+' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary hover:bg-primary/5" onClick={() => openMarkDialog(student)}>
                        <Edit3 className="h-4 w-4" /> Assign Marks
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mark Assignment Dialog */}
      <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> Assign Semester Marks
            </DialogTitle>
            <DialogDescription>
              Record results for {selectedStudent?.firstName} ({selectedStudent?.degreeType || 'UG'}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMarks} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Semester</Label>
              <Select onValueChange={handleSemesterChange} defaultValue={selectedSemester}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSemesters(selectedStudent?.degreeType).map(sem => (
                    <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CAT-1 (Max 50)</Label>
                <Input 
                  type="number" 
                  value={cat1} 
                  onChange={e => setCat1(e.target.value)} 
                  placeholder="0"
                  className="bg-slate-50 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CAT-2 (Max 50)</Label>
                <Input 
                  type="number" 
                  value={cat2} 
                  onChange={e => setCat2(e.target.value)} 
                  placeholder="0"
                  className="bg-slate-50 border-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Model Exam (Max 100)</Label>
              <Input 
                type="number" 
                value={modelExam} 
                onChange={e => setModelExam(e.target.value)} 
                placeholder="0"
                className="bg-slate-50 border-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Final Semester Exam (Max 100)</Label>
              <Input 
                type="number" 
                value={finalSemester} 
                onChange={e => setFinalSemester(e.target.value)} 
                placeholder="0"
                className="bg-slate-50 border-none"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save Semester {selectedSemester} Results
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
