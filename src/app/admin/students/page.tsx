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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  TrendingUp,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  FileUser,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/dialog";
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { StudentBioHover } from '@/components/StudentBioHover';

const collegeId = 'study-connect-college';

const STUDENT_CSV_COLUMNS: CsvColumn[] = [
  { key: 'firstName', label: 'First Name', description: 'Legal first name.', example: 'Alex', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name.', example: 'Johnson', required: true },
  { key: 'email', label: 'Institutional Email', description: 'Assigned student email.', example: 'alex.j@college.edu', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'ID of the department (e.g. dept-eng).', example: 'dept-eng', required: true },
  { key: 'status', label: 'Enrollment Status', description: 'active or inactive.', example: 'active', required: false },
];

export default function StudentManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
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

  // Fetch Bio Data for Preview (Used in the manual detailed dialog)
  const selectedBioRef = useMemoFirebase(() => {
    if (!firestore || !selectedStudentId) return null;
    return doc(firestore, 'colleges', collegeId, 'studentProfiles', selectedStudentId);
  }, [firestore, selectedStudentId]);
  const { data: bioData, isLoading: bioLoading } = useDoc(selectedBioRef);

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
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">The student directory contains private academic records and is only accessible to verified administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1 font-body">Live institutional records and performance monitoring.</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Bulk Enroll Students"
            description="Onboard an entire batch by uploading a CSV file with student identities and department codes."
            columns={STUDENT_CSV_COLUMNS}
          />
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-xl px-6">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Average GPA
            </CardDescription>
            <CardTitle className="text-2xl text-foreground font-headline">3.73 / 4.0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-accent/5 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-accent-foreground font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Clock className="h-3 w-3" /> Avg Attendance
            </CardDescription>
            <CardTitle className="text-2xl text-foreground font-headline">94.1%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-primary/10 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <BookOpen className="h-3 w-3" /> Active Enrollment
            </CardDescription>
            <CardTitle className="text-2xl text-foreground font-headline">{students.length}</CardTitle>
          </CardHeader>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              className="pl-10 bg-muted border-none h-11 shadow-none rounded-xl"
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
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-foreground py-4 pl-6">Student</TableHead>
                  <TableHead className="font-bold text-foreground">ID / Dept</TableHead>
                  <TableHead className="font-bold text-foreground">Performance</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-bold text-foreground pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="group transition-colors hover:bg-muted/50 border-border">
                    <TableCell className="py-4 pl-6">
                      <StudentBioHover student={student}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{student.firstName} {student.lastName}</span>
                            <span className="text-[10px] text-muted-foreground">{student.email}</span>
                          </div>
                        </div>
                      </StudentBioHover>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-muted-foreground">#{student.id.slice(0, 6)}</span>
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary w-fit mt-1 px-1">
                          {student.departmentId || 'Not Assigned'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 border-none">
                        3.8 GPA
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", student.status === 'inactive' ? 'bg-muted-foreground/30' : 'bg-emerald-500')} />
                        <span className="text-xs font-semibold capitalize text-muted-foreground">{student.status || 'Active'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border shadow-xl rounded-xl">
                          <DropdownMenuItem className="gap-2" onClick={() => setSelectedStudentId(student.id)}>
                            <FileUser className="h-4 w-4" /> View Bio Data
                          </DropdownMenuItem>
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

      <Dialog open={!!selectedStudentId} onOpenChange={(o) => !o && setSelectedStudentId(null)}>
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <FileUser className="text-primary" /> Institutional Bio Data
            </DialogTitle>
          </DialogHeader>
          {bioLoading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>
          ) : bioData ? (
            <div className="grid grid-cols-2 gap-6 pt-4 font-body">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</p>
                <p className="font-bold">{bioData.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</p>
                <p className="font-bold">{bioData.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</p>
                <p className="font-bold">{bioData.phoneNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quota</p>
                <Badge variant="secondary" className="font-bold">{bioData.quota}</Badge>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address</p>
                <p className="font-medium text-sm">{bioData.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Father</p>
                <p className="font-bold">{bioData.fatherName}</p>
                <p className="text-xs text-muted-foreground">{bioData.fatherPhoneNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mother</p>
                <p className="font-bold">{bioData.motherName}</p>
                <p className="text-xs text-muted-foreground">{bioData.motherPhoneNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aadhar</p>
                <p className="font-mono text-sm font-bold">{bioData.aadharNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Religion</p>
                <p className="font-bold">{bioData.religion}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
              No bio data profile found for this student.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
