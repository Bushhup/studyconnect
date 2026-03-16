'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Users, Clock, MapPin, 
  ChevronRight, FileText, Briefcase, 
  Filter, GraduationCap, Layers
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

const SUBJECTS = [
  { id: '1', name: 'Machine Learning', code: 'CS-402', faculty: 'Dr. Sarah Smith', credits: 4, timing: 'Mon, Wed • 09:00 AM', room: 'Lab 302', sem: 'Sem 5' },
  { id: '2', name: 'Advanced Algorithms', code: 'CS-101', faculty: 'Prof. James Wilson', credits: 4, timing: 'Tue, Thu • 11:15 AM', room: 'Hall B', sem: 'Sem 5' },
  { id: '3', name: 'Applied Physics', code: 'PHY-102', faculty: 'Dr. Emily Davis', credits: 3, timing: 'Fri • 10:00 AM', room: 'Auditorium', sem: 'Sem 5' },
  { id: '4', name: 'Discrete Mathematics', code: 'MATH-201', faculty: 'Dr. Robert Brown', credits: 4, timing: 'Mon, Wed • 02:00 PM', room: 'Hall A', sem: 'Sem 5' },
];

export default function StudentSubjects() {
  const [semester, setSemester] = useState('5');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Active Curriculum</h1>
          <p className="text-muted-foreground mt-1">Directory of courses and assigned faculty for the current semester.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-full shadow-sm border">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[160px] border-none bg-transparent h-9 text-xs font-bold uppercase tracking-tight">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <SelectValue placeholder="Semester" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map((item) => (
          <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-[2rem] overflow-hidden bg-white">
            <div className="h-2 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                 <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase tracking-widest">
                   {item.credits} Units
                 </Badge>
                 <p className="text-[10px] font-mono font-bold text-muted-foreground">{item.code}</p>
              </div>
              <CardTitle className="text-xl font-headline mt-2 group-hover:text-primary transition-colors">{item.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.faculty}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{item.timing}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{item.room}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-xs font-bold">
                    <Link href="/student/resources">
                      <FileText className="h-3.5 w-3.5" /> Study Notes
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-xs font-bold">
                    <Link href="/student/assignments">
                      <Briefcase className="h-3.5 w-3.5" /> Tasks
                    </Link>
                  </Button>
               </div>
               
               <Button variant="outline" className="w-full rounded-xl gap-2 font-bold text-xs h-11 border-dashed">
                  View Syllabus & Details <ChevronRight className="h-3.5 w-3.5" />
               </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
