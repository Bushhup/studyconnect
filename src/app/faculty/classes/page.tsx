'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calendar, Clock, MapPin, 
  BookOpen, ChevronRight, GraduationCap,
  MessageCircle, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const CLASSES = [
  { id: '1', name: 'Machine Learning', code: 'CS-402', dept: 'Engineering', students: 42, timing: 'Mon, Wed • 09:00 AM', room: 'Lab 302', sem: 'Sem 5', degree: 'UG' },
  { id: '2', name: 'Advanced Algorithms', code: 'CS-101', dept: 'Engineering', students: 38, timing: 'Tue, Thu • 11:15 AM', room: 'Hall B', sem: 'Sem 5', degree: 'UG' },
  { id: '3', name: 'Data Science Lab', code: 'DS-201', dept: 'Engineering', students: 18, timing: 'Fri • 02:00 PM', room: 'Lab 1', sem: 'Sem 2', degree: 'PG' },
];

export default function FacultyClasses() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">My Academic Loads</h1>
          <p className="text-muted-foreground mt-1">Directory of your assigned sections and subject allotments.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-6">
          <Calendar className="h-4 w-4" /> Full Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CLASSES.map((item) => (
          <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-[2rem] overflow-hidden bg-white">
            <div className="h-2 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                 <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase tracking-widest">
                   {item.degree} • {item.sem}
                 </Badge>
                 <p className="text-[10px] font-mono font-bold text-muted-foreground">{item.code}</p>
              </div>
              <CardTitle className="text-xl font-headline mt-2 group-hover:text-primary transition-colors">{item.name}</CardTitle>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.dept}</p>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                     <Users className="h-4 w-4 text-slate-400" />
                     <div>
                        <p className="text-sm font-bold">{item.students}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Students</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                     <MapPin className="h-4 w-4 text-slate-400" />
                     <div>
                        <p className="text-sm font-bold">{item.room}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Location</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 p-3 border border-dashed rounded-2xl">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-slate-700">{item.timing}</span>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-xs font-bold">
                    <Link href="/faculty/attendance">
                      <ClipboardCheck className="h-3.5 w-3.5" /> Mark Presence
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-xs font-bold">
                    <Link href="/faculty/marks">
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Add Grades
                    </Link>
                  </Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
