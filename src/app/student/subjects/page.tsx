'use client';

import { useCollection, useMemoFirebase, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Clock, MapPin, Loader2,
  ChevronRight, FileText, Briefcase, 
  Layers
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

const collegeId = 'study-connect-college';

export default function StudentSubjects() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch Student Profile to get departmentId
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile } = useDoc(profileRef);

  // Fetch Courses for the student's department
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore || !profile?.departmentId) return null;
    return query(
      collection(firestore, 'colleges', collegeId, 'courses'),
      where('departmentId', '==', profile.departmentId)
    );
  }, [firestore, profile?.departmentId]);

  const { data: courses, isLoading } = useCollection(coursesQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading your curriculum...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Active Curriculum</h1>
          <p className="text-muted-foreground mt-1">Directory of courses and assigned faculty for your current department.</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-1 rounded-full shadow-sm border">
          <Badge className="bg-primary text-white border-none font-bold uppercase text-[10px] px-4 py-1.5 rounded-full">
            Semester {profile?.semester || 'Current'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((item) => (
          <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-[2rem] overflow-hidden bg-card">
            <div className="h-2 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                 <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase tracking-widest">
                   {item.credits} Academic Credits
                 </Badge>
                 <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{item.code}</p>
              </div>
              <CardTitle className="text-xl font-headline mt-2 group-hover:text-primary transition-colors">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="bg-muted/50 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary opacity-60" />
                    <span className="text-foreground">Check your timetable for sessions</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary opacity-60" />
                    <span className="text-foreground">Refer to Room Allocation</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-[10px] uppercase font-bold">
                    <Link href="/student/resources">
                      <FileText className="h-3.5 w-3.5" /> Study Notes
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-[10px] uppercase font-bold">
                    <Link href="/student/assignments">
                      <Briefcase className="h-3.5 w-3.5" /> Tasks
                    </Link>
                  </Button>
               </div>
               
               <Button variant="outline" className="w-full rounded-xl gap-2 font-bold text-xs h-11 border-dashed bg-transparent">
                  View Syllabus & Details <ChevronRight className="h-3.5 w-3.5" />
               </Button>
            </CardContent>
          </Card>
        ))}

        {courses?.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <p className="font-bold text-foreground">No subjects found for your department.</p>
            <p className="text-xs text-muted-foreground mt-1">Please ensure your department selection in profile is correct.</p>
          </div>
        )}
      </div>
    </div>
  );
}
