'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, Award, Trophy, TrendingUp, 
  BarChart3, Download, Layers, CheckCircle2,
  AlertCircle, ChevronRight
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const MOCK_MARKS = [
  { id: '1', subject: 'Machine Learning', cat1: 42, cat2: 45, internal: 18, total: 87, grade: 'O' },
  { id: '2', subject: 'Advanced Algorithms', cat1: 38, cat2: 40, internal: 15, total: 78, grade: 'A+' },
  { id: '3', subject: 'Applied Physics', cat1: 44, cat2: 42, internal: 19, total: 86, grade: 'O' },
  { id: '4', subject: 'Discrete Mathematics', cat1: 35, cat2: 38, internal: 14, total: 73, grade: 'A' },
  { id: '5', subject: 'Design Thinking', cat1: 40, cat2: 35, internal: 12, total: 67, grade: 'B+' },
];

export default function StudentMarks() {
  const [semester, setSemester] = useState('5');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Grades & Assessments</h1>
          <p className="text-muted-foreground mt-1">Review your marks for internal assessments and continuous evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200 rounded-full h-10 text-xs font-bold shadow-sm">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full gap-2 border-slate-200 bg-white shadow-sm h-10">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline">Internal Assessment Ledger</CardTitle>
              <CardDescription>Academic Year 2024-25 • Sem {semester}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] tracking-widest px-3">Sync Status: Live</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/20">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="font-bold pl-6 py-4">Subject Name</TableHead>
                  <TableHead className="font-bold text-center">CAT-1 (50)</TableHead>
                  <TableHead className="font-bold text-center">CAT-2 (50)</TableHead>
                  <TableHead className="font-bold text-center">Internal (20)</TableHead>
                  <TableHead className="font-bold text-center">Current Total</TableHead>
                  <TableHead className="font-bold">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_MARKS.map((row) => (
                  <TableRow key={row.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                    <TableCell className="pl-6 py-4">
                      <p className="font-bold text-slate-800">{row.subject}</p>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-600">{row.cat1}</TableCell>
                    <TableCell className="text-center font-bold text-slate-600">{row.cat2}</TableCell>
                    <TableCell className="text-center font-bold text-primary">{row.internal}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-slate-900">{row.total}%</span>
                        <Progress value={row.total} className="h-1 w-12 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-bold border-none px-3 py-0.5",
                        row.grade === 'O' ? "bg-emerald-100 text-emerald-700" :
                        row.grade === 'A+' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {row.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-white rounded-[2.5rem] p-6 relative overflow-hidden">
            <Trophy className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Top Scorer In</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Applied Physics</p>
                <p className="text-xs text-white/60">Class Rank #1 • Score 94/100</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Class Average Comparison</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {[
                { label: 'My Performance', val: 82, color: 'bg-primary' },
                { label: 'Class Average', val: 74, color: 'bg-slate-200' },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.val}%</span>
                  </div>
                  <Progress value={item.val} className={cn("h-1.5", item.color)} />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-tight text-primary mt-2">
              View Detailed Analytics <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
