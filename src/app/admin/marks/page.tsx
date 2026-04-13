'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileSpreadsheet, Download, Send, TrendingUp, Trophy, Edit3, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const MARKS_CSV_COLUMNS: CsvColumn[] = [
  { key: 'studentId', label: 'Student ID', description: 'Unique institutional ID of the student.', example: 'S-101', required: true },
  { key: 'subject', label: 'Subject Name', description: 'Course name or code.', example: 'Machine Learning', required: true },
  { key: 'cat1', label: 'CAT-1', description: 'Continuous Assessment 1 score.', example: '42', required: true },
  { key: 'cat2', label: 'CAT-2', description: 'Continuous Assessment 2 score.', example: '45', required: true },
  { key: 'model', label: 'Model Exam', description: 'Mock semester exam score.', example: '88', required: false },
  { key: 'final', label: 'Final Exam', description: 'Main semester exam score.', example: '94', required: false },
];

const chartData = [
  { name: 'CAT-1', avg: 72 },
  { name: 'CAT-2', avg: 78 },
  { name: 'Model', avg: 82 },
  { name: 'Final', avg: 88 },
];

const STATIC_STUDENTS = [
  { id: 'S-1', firstName: 'Alex', lastName: 'Johnson', degree: 'UG', score: 92, grade: 'O' },
  { id: 'S-2', firstName: 'Sarah', lastName: 'Miller', degree: 'UG', score: 98, grade: 'O' },
  { id: 'S-3', firstName: 'James', lastName: 'Wilson', degree: 'UG', score: 85, grade: 'A+' },
  { id: 'S-4', firstName: 'Emily', lastName: 'Chen', degree: 'PG', score: 78, grade: 'A' },
];

export default function MarksManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filteredStudents = STATIC_STUDENTS.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Grading</h1>
          <p className="text-muted-foreground mt-1">Manage institutional assessments and results (Static Prototype).</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Import Grade Ledger"
            description="Publish results for an entire department by uploading a CSV with student scores."
            columns={MARKS_CSV_COLUMNS}
          />
          <Button variant="outline" className="gap-2 shadow-sm rounded-full h-11">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
            <Send className="h-4 w-4" /> Publish Portal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-headline">Assessment Progression</CardTitle>
              <CardDescription>Average scores for Academic Year 2024</CardDescription>
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
          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative rounded-[2rem]">
            <Trophy className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12" />
            <CardHeader className="pb-2">
               <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest">Top Scorer</CardDescription>
               <CardTitle className="text-2xl">Sarah Miller</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-2 text-3xl font-bold">
                 98.4 <span className="text-sm font-medium text-white/70">GPA 4.0</span>
               </div>
               <p className="text-[10px] text-white/60 mt-2 font-medium">Rank #1 • UG Program</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white rounded-[2rem]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>UG (6 Semesters)</span>
                  <span className="text-slate-400">85%</span>
                </div>
                <Progress value={85} className="h-1 bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>PG (4 Semesters)</span>
                  <span className="text-slate-400">42%</span>
                </div>
                <Progress value={42} className="h-1 bg-slate-100" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                className="pl-10 bg-slate-50 border-none h-11 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-4 py-1.5 uppercase rounded-full">
              Sem 4 • 2024-25
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-bold pl-6 py-4">Student Name</TableHead>
                <TableHead className="font-bold">Degree Program</TableHead>
                <TableHead className="font-bold text-center">Current Sem</TableHead>
                <TableHead className="font-bold text-center">Avg Score</TableHead>
                <TableHead className="font-bold">Grade</TableHead>
                <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="group hover:bg-slate-50/50 border-slate-100 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{student.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold">
                       {student.degree} Program
                     </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-600">4</TableCell>
                  <TableCell className="text-center font-bold">{student.score}%</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-bold border-none px-3",
                      student.grade === 'O' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {student.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary rounded-lg" onClick={() => {setSelectedStudent(student); setIsMarkDialogOpen(true);}}>
                      <Edit3 className="h-4 w-4" /> Edit Marks
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> Assign Marks
            </DialogTitle>
            <DialogDescription>Assign academic results for {selectedStudent?.firstName} (Prototype).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Semester</Label>
              <Select defaultValue="4">
                <SelectTrigger className="bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Semester 3</SelectItem>
                  <SelectItem value="4">Semester 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CAT-1 (Max 50)</Label>
                <Input type="number" placeholder="0" className="bg-slate-50 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CAT-2 (Max 50)</Label>
                <Input type="number" placeholder="0" className="bg-slate-50 border-none" />
              </div>
            </div>
            <Button className="w-full h-12 font-bold shadow-lg shadow-primary/20" onClick={() => {toast({ title: 'Record Saved', description: 'Marks archived in local memory.' }); setIsMarkDialogOpen(false);}}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Save Result
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
