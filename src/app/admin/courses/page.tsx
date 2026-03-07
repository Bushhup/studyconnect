
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, GraduationCap, Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const collegeId = 'study-connect-college';

export default function CourseManagementPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'courses');
  }, [firestore]);

  const { data: courses, isLoading } = useCollection(coursesQuery);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Curriculum Management</h1>
          <p className="text-muted-foreground mt-1">Define courses, credits, and degree requirements.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add New Course
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses by name or code..." 
            className="pl-10 bg-white border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Department</Button>
           <Button variant="outline" size="sm" className="gap-2"><GraduationCap className="h-4 w-4" /> Semester</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold py-4 pl-6">Course Code</TableHead>
                <TableHead className="font-bold">Course Title</TableHead>
                <TableHead className="font-bold">Credits</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="text-right font-bold pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : courses?.map((course) => (
                <TableRow key={course.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4 pl-6 font-mono font-bold text-primary">
                    {course.code || 'CS101'}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {course.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">
                       {course.credits || 4} Units
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm text-slate-600">Core Academic</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Edit Syllabus</Button>
                  </TableCell>
                </TableRow>
              ))}
              {courses?.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No courses found in the current registry.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
