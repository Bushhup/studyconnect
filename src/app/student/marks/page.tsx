'use client';

import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, Award, Trophy, TrendingUp, 
  Download, Layers, Loader2, ChevronRight
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
import { useState } from 'react';

const collegeId = 'study-connect-college';

export default function StudentMarks() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [semester, setSemester] = useState('5');

  // Fetch academic records for this student
  const recordsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(
      collection(firestore, 'colleges', collegeId, 'academicRecords'),
      where('studentId', '==', user.email.toLowerCase())
    );
  }, [firestore, user?.email]);

  // Fetch courses to map names
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'courses');
  }, [firestore]);

  const { data: records, isLoading: recordsLoading } = useCollection(recordsQuery);
  const { data: courses } = useCollection(coursesQuery);

  if (recordsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Retrieving grade card...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Grades & Assessments</h1>
          <p className="text-muted-foreground mt-1">Review your marks for internal assessments and continuous evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[160px] bg-card border-slate-200 rounded-full h-10 text-xs font-bold shadow-sm">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full gap-2 border-slate-200 bg-card shadow-sm h-10">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline">Internal Assessment Ledger</CardTitle>
              <CardDescription>Verified results for Semester {semester}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] tracking-widest px-3">Official Records</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="font-bold pl-6 py-4">Subject Name</TableHead>
                  <TableHead className="font-bold text-center">CAT-1</TableHead>
                  <TableHead className="font-bold text-center">CAT-2</TableHead>
                  <TableHead className="font-bold text-center">Final Weight</TableHead>
                  <TableHead className="font-bold">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.map((record) => {
                  const course = courses?.find(c => c.id === record.subjectId);
                  const total = (record.marks?.cat1 || 0) + (record.marks?.cat2 || 0) + (record.marks?.final || 0);
                  
                  return (
                    <TableRow key={record.id} className="group hover:bg-muted/30 transition-colors border-border">
                      <TableCell className="pl-6 py-4">
                        <p className="font-bold text-foreground">{course?.name || record.subjectId}</p>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase">{course?.code}</p>
                      </TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{record.marks?.cat1 || '-'}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{record.marks?.cat2 || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-foreground">{total}%</span>
                          <Progress value={total} className="h-1 w-12 bg-muted" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "font-bold border-none px-3 py-0.5",
                          total > 85 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {total > 85 ? 'Grade O' : total > 70 ? 'Grade A+' : 'Pass'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {records?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-24 text-center text-muted-foreground italic">No assessment records found for this term.</TableCell>
                  </TableRow>
                )}
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Top Performance</p>
              </div>
              <div>
                <p className="text-xl font-bold">Maintain Momentum</p>
                <p className="text-xs text-white/60 leading-relaxed">Your marks are currently above the institutional average.</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-[2.5rem] p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Summary</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Credits Earned</span>
                  <span className="text-foreground">17 / 17</span>
                </div>
                <Progress value={100} className="h-1.5 bg-muted" />
              </div>
            </div>
            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-tight text-primary mt-2">
              View Transcript Details <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
