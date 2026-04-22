'use client';

import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calendar, Clock, MapPin, 
  Loader2, ClipboardCheck, FileSpreadsheet, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const collegeId = 'study-connect-college';

export default function FacultyClasses() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch classes where this faculty member is assigned
  // Note: We check if they are the primary facultyId for the class
  const classesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(
      collection(firestore, 'colleges', collegeId, 'classes'), 
      where('facultyId', '==', user.email.toLowerCase())
    );
  }, [firestore, user?.email]);

  const { data: classes, isLoading } = useCollection(classesQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing your assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">My Academic Loads</h1>
          <p className="text-muted-foreground mt-1">Directory of your assigned sections and subject allotments.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-6">
          <Calendar className="h-4 w-4" /> Full Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes?.map((item) => (
          <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-[2rem] overflow-hidden bg-card">
            <div className="h-2 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                 <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase tracking-widest">
                   Semester {item.semester || 'N/A'}
                 </Badge>
              </div>
              <CardTitle className="text-xl font-headline mt-2 group-hover:text-primary transition-colors">{item.name}</CardTitle>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assigned Section</p>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-2xl flex items-center gap-3">
                     <Users className="h-4 w-4 text-primary" />
                     <div>
                        <p className="text-sm font-bold">{item.studentIds?.length || 0}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Students</p>
                     </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-2xl flex items-center gap-3">
                     <MapPin className="h-4 w-4 text-primary" />
                     <div>
                        <p className="text-sm font-bold">Lab 302</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Room</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 p-3 border border-dashed rounded-2xl">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Official Time: See Timetable</span>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-[10px] uppercase font-bold">
                    <Link href={`/faculty/attendance?classId=${item.id}`}>
                      <ClipboardCheck className="h-3.5 w-3.5" /> Attendance
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-xl h-10 gap-2 text-[10px] uppercase font-bold">
                    <Link href={`/faculty/marks?classId=${item.id}`}>
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Grading
                    </Link>
                  </Button>
               </div>
            </CardContent>
          </Card>
        ))}

        {classes?.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <p className="font-bold text-foreground">No classes assigned to your profile.</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Please contact the Administrator or HOD to link your identity to specific academic sections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
