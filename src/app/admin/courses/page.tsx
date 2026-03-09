'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, GraduationCap, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const STATIC_COURSES = [
  { id: 'c1', code: 'CS101', name: 'Intro to Computer Science', credits: 4, type: 'Core' },
  { id: 'c2', code: 'AI402', name: 'Machine Learning Systems', credits: 4, type: 'Elective' },
  { id: 'c3', code: 'UX201', name: 'User Experience Design', credits: 3, type: 'Elective' },
  { id: 'c4', code: 'MATH101', name: 'Engineering Mathematics I', credits: 4, type: 'Core' },
  { id: 'c5', code: 'PHY102', name: 'Applied Physics Lab', credits: 2, type: 'Core' },
];

export default function CourseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = STATIC_COURSES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Curriculum Management</h1>
          <p className="text-muted-foreground mt-1">Define courses, credits, and degree requirements (Static Prototype).</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
          <Plus className="h-4 w-4" /> Add New Course
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses by name or code..." 
            className="pl-10 bg-white border-none shadow-sm h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2 rounded-full"><Filter className="h-4 w-4" /> Department</Button>
           <Button variant="outline" size="sm" className="gap-2 rounded-full"><GraduationCap className="h-4 w-4" /> Semester</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold py-4 pl-6">Course Code</TableHead>
                <TableHead className="font-bold">Course Title</TableHead>
                <TableHead className="font-bold text-center">Credits</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="text-right font-bold pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4 pl-6 font-mono font-bold text-primary">
                    {course.code}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold border-none">
                       {course.credits} Units
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm font-medium text-slate-600">{course.type}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-lg">Edit Syllabus</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
