
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
  BookOpen,
  Loader2,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const collegeId = 'study-connect-college';

const programs = {
  UG: ['CSE', 'B-TECH', 'AI/DS', 'MECH', 'ECE', 'EEE'],
  PG: ['MCA', 'MBA']
};

export default function StudentManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Registration State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    departmentId: '',
    degreeType: 'UG' as 'UG' | 'PG'
  });

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
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const emailStr = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || emailStr.includes(query);
    const matchesDept = deptFilter === 'all' || u.departmentId === deptFilter;
    return isStudent && matchesSearch && matchesDept;
  }) || [];

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.email || !newStudent.firstName || !newStudent.departmentId) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill in all fields including the program.' });
      return;
    }

    setIsSubmitting(true);
    const studentEmail = newStudent.email.toLowerCase().trim();
    const studentPass = newStudent.password.trim();
    
    // CRITICAL: For the bootstrap logic to work, use email as the initial document ID
    const userRef = doc(firestore, 'colleges', collegeId, 'users', studentEmail);
    
    setDocumentNonBlocking(userRef, {
      id: studentEmail,
      collegeId: collegeId,
      email: studentEmail,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      password: studentPass,
      role: 'student',
      status: 'active',
      departmentId: newStudent.departmentId,
      degreeType: newStudent.degreeType,
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Student Registered', description: `${newStudent.firstName} has been added to the ${newStudent.departmentId} program.` });
    setIsAddOpen(false);
    setIsSubmitting(false);
    setNewStudent({ firstName: '', lastName: '', email: '', password: '', departmentId: '', degreeType: 'UG' });
  };

  const handleDeactivate = (id: string, name: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'colleges', collegeId, 'users', id);
    updateDocumentNonBlocking(userRef, { status: 'inactive' });
    toast({ title: 'Record Deactivated', description: `Academic record for ${name} is now inactive.` });
  };

  const currentAvailablePrograms = programs[newStudent.degreeType];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1">Manage institutional records, monitor performance, and track attendance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Import Utility", description: "Select a .csv file to batch process student records." })}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Export Started", description: "Generating institutional CSV report..." })}>
            <Download className="h-4 w-4" /> Export Data
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Student</DialogTitle>
                <DialogDescription>Create a new institutional record. Normalization will be applied to the email and password.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">First Name</Label>
                    <Input value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} required className="bg-slate-50 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Last Name</Label>
                    <Input value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="bg-slate-50 border-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Institutional Email</Label>
                  <Input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} required className="bg-slate-50 border-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Program Type</Label>
                    <Select 
                      onValueChange={(v: 'UG' | 'PG') => setNewStudent({...newStudent, degreeType: v, departmentId: ''})} 
                      defaultValue={newStudent.degreeType}
                    >
                      <SelectTrigger className="bg-slate-50 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                        <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Initial Password</Label>
                    <div className="relative">
                       <Input type="text" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} required className="pl-9 bg-slate-50 border-none" />
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Academic Department / Program</Label>
                  <Select onValueChange={v => setNewStudent({...newStudent, departmentId: v})} value={newStudent.departmentId}>
                    <SelectTrigger className="bg-slate-50 border-none">
                      <SelectValue placeholder="Choose program..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentAvailablePrograms.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full mt-4 font-bold shadow-lg shadow-primary/20 h-11" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  Confirm Enrollment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-primary/5 border-l-4 border-primary">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Average GPA
            </CardDescription>
            <CardTitle className="text-2xl">3.82 / 4.0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500/5 to-accent/5 border-l-4 border-accent">
          <CardHeader className="pb-2">
            <CardDescription className="text-accent font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Clock className="h-3 w-3" /> Avg Attendance
            </CardDescription>
            <CardTitle className="text-2xl">92.4%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-l-4 border-amber-500">
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
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students by name, ID or email..." 
                className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-md h-11 flex-1 lg:flex-none">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-full lg:w-[220px] bg-transparent border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Filter by Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Global (All Depts)</SelectItem>
                    <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold px-2 py-1">UG Programs</DropdownMenuLabel>
                    {programs.UG.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold px-2 py-1">PG Programs</DropdownMenuLabel>
                    {programs.PG.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
                <TableHead className="font-bold text-slate-900 text-center">Program</TableHead>
                <TableHead className="font-bold text-slate-900">Performance</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isUsersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : students.map((student) => {
                const deptName = student.departmentId || 'General';
                const attendance = 85 + Math.floor(Math.random() * 12); 
                const gpa = (3.2 + Math.random() * 0.8).toFixed(2);
                
                return (
                  <TableRow key={student.id} className="group transition-colors hover:bg-slate-50/50 border-slate-100">
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
                          <span className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate max-w-[150px]">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-600 truncate max-w-[120px]">
                          #{student.id.substring(0, 8).toUpperCase()}
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary w-fit mt-1 px-1">
                          {deptName}
                        </Badge>
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
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">
                        {student.degreeType || 'UG'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-3">
                        {gpa} GPA
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          student.status === 'inactive' ? 'bg-slate-300' : 'bg-emerald-500'
                        )} />
                        <span className="text-xs font-semibold capitalize text-slate-600">
                          {student.status || 'Active'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Administrative Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2" onClick={() => toast({ title: 'Profile View', description: 'Opening academic history module...' })}>
                            <GraduationCap className="h-4 w-4" /> View Full History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => toast({ title: 'Attendance', description: 'Accessing attendance log...' })}>
                            <Clock className="h-4 w-4" /> Attendance Detail
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDeactivate(student.id, `${student.firstName} ${student.lastName}`)}
                          >
                            Deactivate Enrollment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isUsersLoading && students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Search className="h-8 w-8 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-lg">No student records found</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                          Try adjusting your search criteria or clear the department filter to see more results.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setDeptFilter('all'); }} className="mt-2">
                        Clear all filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="border-t p-4 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs text-muted-foreground">
            Showing <strong>{students.length}</strong> active enrollments
          </p>
          <div className="flex gap-1">
             <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="sm" className="h-8 font-bold bg-white">1</Button>
             <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronRight className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
