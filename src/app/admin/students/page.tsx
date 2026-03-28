
'use client';

import { useState } from 'react';
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
  Plus, 
  MoreHorizontal, 
  GraduationCap,
  TrendingUp,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

const collegeId = 'study-connect-college';

export default function StudentManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const firestore = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, isAdmin]);

  const { data: users, isLoading: collectionLoading } = useCollection(studentsQuery);
  const students = users?.filter(u => u.role === 'student') || [];

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div>
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">The student directory contains private academic records and is only accessible to verified administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1">Live institutional records and performance monitoring.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Average GPA
            </CardDescription>
            <CardTitle className="text-2xl">3.73 / 4.0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-accent/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-accent font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Clock className="h-3 w-3" /> Avg Attendance
            </CardDescription>
            <CardTitle className="text-2xl">94.1%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <BookOpen className="h-3 w-3" /> Active Enrollment
            </CardDescription>
            <CardTitle className="text-2xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="border-b pb-6">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              className="pl-10 bg-slate-50 border-none h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {collectionLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing records...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-900 py-4 pl-6">Student</TableHead>
                  <TableHead className="font-bold text-slate-900">ID / Dept</TableHead>
                  <TableHead className="font-bold text-slate-900">Performance</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-900 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="group transition-colors hover:bg-slate-50/50 border-slate-100">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{student.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-600">#{student.id.slice(0, 6)}</span>
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary w-fit mt-1 px-1">
                          {student.departmentId || 'Not Assigned'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold px-3">
                        3.8 GPA
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", student.status === 'inactive' ? 'bg-slate-300' : 'bg-emerald-500')} />
                        <span className="text-xs font-semibold capitalize text-slate-600">{student.status || 'Active'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Attendance History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      No student records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
