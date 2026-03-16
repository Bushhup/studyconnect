'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Award, Download, Layers, CheckCircle2, 
  Trophy, TrendingUp, GraduationCap, ChevronRight,
  FileSpreadsheet, Star
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SEMESTER_RESULTS = [
  { id: '1', subject: 'Machine Learning', credits: 4, marks: 92, grade: 'O', status: 'Pass' },
  { id: '2', subject: 'Advanced Algorithms', credits: 4, marks: 85, grade: 'A+', status: 'Pass' },
  { id: '3', subject: 'Applied Physics', credits: 3, marks: 88, grade: 'O', status: 'Pass' },
  { id: '4', subject: 'Discrete Mathematics', credits: 4, marks: 78, grade: 'A', status: 'Pass' },
  { id: '5', subject: 'Design Thinking', credits: 2, marks: 72, grade: 'B+', status: 'Pass' },
];

export default function StudentResults() {
  const [semester, setSemester] = useState('4');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">End-Semester Results</h1>
          <p className="text-muted-foreground mt-1">Official statement of marks and credit evaluations for completed terms.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200 rounded-full h-10 text-xs font-bold shadow-sm">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map(s => (
                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="rounded-full gap-2 shadow-lg shadow-primary/20 h-10 px-6">
            <Download className="h-4 w-4" /> Download Grade Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-headline font-bold">Official Scorecard</CardTitle>
                  <CardDescription>Examination Phase: May 2024 (Semester {semester})</CardDescription>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold px-4 py-1">Result: PASS</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/20">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-bold pl-6 py-4">Course Title</TableHead>
                    <TableHead className="font-bold text-center">Credits</TableHead>
                    <TableHead className="font-bold text-center">Marks</TableHead>
                    <TableHead className="font-bold text-center">Grade</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SEMESTER_RESULTS.map((row) => (
                    <TableRow key={row.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                      <TableCell className="pl-6 py-4">
                        <p className="font-bold text-slate-800">{row.subject}</p>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-500">{row.credits}</TableCell>
                      <TableCell className="text-center font-bold text-slate-900">{row.marks}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "font-bold border-none px-3",
                          row.grade === 'O' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {row.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{row.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Semester Metrics</p>
                <p className="text-2xl font-bold font-headline">SGPA: 3.82</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 font-bold uppercase tracking-tight">Total Credits</span>
                <span className="text-sm font-bold">17 / 17</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 font-bold uppercase tracking-tight">Overall CGPA</span>
                <span className="text-sm font-bold text-emerald-400">3.73</span>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-12">
              View Detailed Analytics
            </Button>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-primary/20 transition-all">
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-primary transition-colors">
                <Award className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Transcript History</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">All semesters consolidated</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          </div >
        </div>
      </div>
    </div>
  );
}
