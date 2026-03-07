'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  MoreHorizontal, 
  GraduationCap,
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const collegeId = 'study-connect-college';

export default function StudentManagementPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const deptsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);
  const { data: departments } = useCollection(deptsQuery);

  const students = users?.filter(u => {
    const isStudent = u.role === 'student';
    const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || u.departmentId === deptFilter;
    return isStudent && matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Student Records</h1>
          <p className="text-muted-foreground mt-1">Monitor academic performance and institutional engagement.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Data
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-700 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Average GPA
            </CardDescription>
            <CardTitle className="text-2xl">3.82 / 4.0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-l-4 border-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Clock className="h-3 w-3" /> Avg Attendance
            </CardDescription>
            <CardTitle className="text-2xl">92.4%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <BookOpen className="h-3 w-3" /> Active Credits
            </CardDescription>
            <CardTitle className="text-2xl">14,250</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-none">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold text-slate-900 py-4 pl-6">Student</TableHead>
                <TableHead className="font-bold text-slate-900">ID / Dept</TableHead>
                <TableHead className="font-bold text-slate-900">Attendance</TableHead>
                <TableHead className="font-bold text-slate-900">Performance</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isUsersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground font-medium">Syncing Records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : students?.map((student) => {
                const deptName = departments?.find(d => d.id === student.departmentId)?.name || 'General';
                // Mocking some data that isn't in the schema yet for visual richness
                const attendance = Math.floor(Math.random() * 20) + 80; // 80-100%
                const gpa = (Math.random() * 1.5 + 2.5).toFixed(2); // 2.5-4.0
                
                return (
                  <TableRow key={student.id} className="group transition-colors hover:bg-slate-50/50">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                          <AvatarImage src={student.photoURL} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 leading-tight">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-tighter">
                            Batch of 2026
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-600">#{student.id.substring(0, 8).toUpperCase()}</span>
                        <span className="text-[10px] text-primary font-bold uppercase">{deptName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-24">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">{attendance}%</span>
                        </div>
                        <Progress value={attendance} className="h-1 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-bold">
                        {gpa} GPA
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          student.status === 'inactive' ? 'bg-slate-300' : 'bg-emerald-500'
                        )} />
                        <span className="text-xs font-semibold capitalize text-slate-600">
                          {student.status || 'Active'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Student Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2"><GraduationCap className="h-4 w-4" /> Academic History</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Clock className="h-4 w-4" /> Attendance Log</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600">Deactivate Record</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isUsersLoading && students?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-slate-50 rounded-full">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">No students found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
                      </div>
                    </div>
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
