'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, BookOpen, Search, Filter, 
  Loader2, UserCheck, TrendingUp, Clock, 
  Building2, GraduationCap, ArrowUpRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

const COURSE_CSV_COLUMNS: CsvColumn[] = [
  { key: 'code', label: 'Course Code', description: 'Unique alphanumeric identifier.', example: 'CS101', required: true },
  { key: 'name', label: 'Course Title', description: 'Full name of the course.', example: 'Introduction to Data Structures', required: true },
  { key: 'credits', label: 'Credits', description: 'Academic weightage units.', example: '4', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'Mapping to a department.', example: 'dept-eng', required: true },
];

export default function CourseManagementPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Data
  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'courses'), [firestore]);
  const classesQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'classes'), [firestore]);
  const facultyQuery = useMemoFirebase(() => query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'faculty')), [firestore]);
  const recordsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'academicRecords'), [firestore]);

  const { data: depts, isLoading: deptsLoading } = useCollection(deptsQuery);
  const { data: courses, isLoading: coursesLoading } = useCollection(coursesQuery);
  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: facultyMembers, isLoading: facultyLoading } = useCollection(facultyQuery);
  const { data: records, isLoading: recordsLoading } = useCollection(recordsQuery);

  const isLoading = deptsLoading || coursesLoading || classesLoading || facultyLoading || recordsLoading;

  // Aggregate Data
  const filteredCourses = courses?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const groupedCourses = depts?.map(dept => ({
    ...dept,
    courses: filteredCourses.filter(c => c.departmentId === dept.id)
  })).filter(group => group.courses.length > 0) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aggregating Institutional Curriculum...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Curriculum Master Ledger</h1>
          <p className="text-muted-foreground mt-1">Cross-departmental subject monitoring with delivery analytics.</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Bulk Syllabus Import"
            description="Register entire curricula by uploading a CSV mapping codes, credits, and requirements."
            columns={COURSE_CSV_COLUMNS}
          />
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
            <Plus className="h-4 w-4" /> Define New Subject
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by subject name or code..." 
            className="pl-10 bg-card border-none shadow-sm h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2 rounded-full bg-card h-10 px-4 text-[10px] font-bold uppercase border-primary/10">
             <Building2 className="h-3.5 w-3.5" /> Department Filter
           </Button>
           <Button variant="outline" size="sm" className="gap-2 rounded-full bg-card h-10 px-4 text-[10px] font-bold uppercase border-primary/10">
             <TrendingUp className="h-3.5 w-3.5" /> Sorting: Performance
           </Button>
        </div>
      </div>

      <div className="space-y-12">
        {groupedCourses.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-headline font-bold text-foreground">{group.name}</h2>
              <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px]">
                {group.courses.length} Subjects
              </Badge>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <Card className="border-none shadow-sm bg-card overflow-hidden rounded-[2rem]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-bold py-4 pl-6 w-[120px]">Code</TableHead>
                      <TableHead className="font-bold">Subject Details</TableHead>
                      <TableHead className="font-bold">Primary Handlers</TableHead>
                      <TableHead className="font-bold text-center">Avg. Attendance</TableHead>
                      <TableHead className="font-bold text-center">Performance</TableHead>
                      <TableHead className="text-right font-bold pr-6">Portal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.courses.map((course) => {
                      // Find Handlers from Classes
                      const relevantClasses = classes?.filter(cls => 
                        Object.values(cls.subjectHandlers || {}).some(() => cls.timetable && Object.values(cls.timetable).some(day => Object.values(day).includes(course.id))) ||
                        cls.subjectHandlers?.[course.id]
                      ) || [];
                      
                      const handlerIds = Array.from(new Set(relevantClasses.map(cls => cls.subjectHandlers?.[course.id]).filter(Boolean)));
                      const handlers = facultyMembers?.filter(f => handlerIds.includes(f.email)) || [];

                      // Aggregate Performance
                      const subjectRecords = records?.filter(r => r.subjectId === course.id) || [];
                      const avgAttendance = subjectRecords.length > 0 
                        ? Math.round(subjectRecords.reduce((acc, r) => acc + (r.attendance || 0), 0) / subjectRecords.length)
                        : 0;

                      const avgMarks = subjectRecords.length > 0
                        ? Math.round(subjectRecords.reduce((acc, r) => {
                            const total = (r.marks?.cat1 || 0) + (r.marks?.cat2 || 0) + (r.marks?.final || 0);
                            return acc + total;
                          }, 0) / subjectRecords.length)
                        : 0;

                      return (
                        <TableRow key={course.id} className="group hover:bg-muted/30 transition-colors border-border">
                          <TableCell className="py-5 pl-6 font-mono font-bold text-primary text-xs uppercase tracking-tighter">
                            {course.code}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-bold text-foreground">{course.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{course.credits} Academic Units</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {handlers.length > 0 ? (
                                handlers.map((h) => (
                                  <div key={h.id} title={`Dr. ${h.firstName} ${h.lastName}`} className="h-8 w-8 rounded-full border-2 border-background bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden">
                                    {h.firstName?.[0]}{h.lastName?.[0]}
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">TBD</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1">
                              <span className={cn(
                                "text-xs font-bold",
                                avgAttendance > 0 && avgAttendance < 75 ? "text-red-500" : "text-emerald-600"
                              )}>{avgAttendance > 0 ? `${avgAttendance}%` : '--'}</span>
                              {avgAttendance > 0 && <Progress value={avgAttendance} className="h-1 w-16 bg-muted" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1">
                              {avgMarks > 0 ? (
                                <Badge className={cn(
                                  "border-none font-bold text-[9px] px-2",
                                  avgMarks > 85 ? "bg-emerald-500/10 text-emerald-600" : 
                                  avgMarks > 70 ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                                )}>
                                  {avgMarks}% Index
                                </Badge>
                              ) : <span className="text-xs text-muted-foreground">No Data</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ))}

        {groupedCourses.length === 0 && !isLoading && (
          <div className="py-32 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <p className="font-bold text-foreground">No curriculum data found for the current divisions.</p>
            <p className="text-xs text-muted-foreground mt-1">Syllabus nodes are managed within individual Department Portals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
