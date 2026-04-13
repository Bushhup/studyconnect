'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Users, Filter, Eye, 
  ArrowUpRight, TrendingUp, BookOpen, Clock,
  MoreVertical, GraduationCap, Award, Loader2,
  FileUser
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const collegeId = 'study-connect-college';

export default function StudentManagement() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [semFilter, setSemFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, user]);

  const { data: users, isLoading: collectionLoading } = useCollection(studentsQuery);
  const students = users?.filter(u => u.role === 'student') || [];

  const filtered = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) &&
    (deptFilter === 'all' || s.departmentId === deptFilter) &&
    (semFilter === 'all' || s.semester === semFilter)
  );

  // Fetch Bio Data for Preview
  const selectedBioRef = useMemoFirebase(() => {
    if (!firestore || !selectedStudentId) return null;
    return doc(firestore, 'colleges', collegeId, 'studentProfiles', selectedStudentId);
  }, [firestore, selectedStudentId]);
  const { data: bioData, isLoading: bioLoading } = useDoc(selectedBioRef);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1">Access detailed student records and track academic milestones.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2 border-slate-200">
            <Filter className="h-4 w-4" /> Export Directory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700 font-bold uppercase text-[10px] tracking-widest">Total Monitored</CardDescription>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Avg Attendance</CardDescription>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">94.1%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-purple-50/50 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-purple-700 font-bold uppercase text-[10px] tracking-widest">Performance Avg</CardDescription>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">3.8 GPA</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or student ID..." 
                className="pl-10 bg-slate-50 border-none h-11 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-[160px] bg-slate-50 border-none h-11 rounded-xl">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="dept-eng">Engineering</SelectItem>
                  <SelectItem value="dept-art">Arts & Design</SelectItem>
                  <SelectItem value="dept-sci">Applied Sciences</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-bold pl-6 py-4">Student Profile</TableHead>
                <TableHead className="font-bold">Academic Info</TableHead>
                <TableHead className="font-bold text-center">Attendance</TableHead>
                <TableHead className="font-bold">Performance</TableHead>
                <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id} className="group hover:bg-slate-50/50 border-slate-100 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">#{student.id.slice(0, 8)} • {student.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-600">{student.departmentId || 'General'}</span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1 border-slate-200">
                          UG Program
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-600">94%</span>
                      <Progress value={94} className="h-1 w-16 bg-slate-100" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="font-bold px-3 py-0.5 border-none bg-emerald-100 text-emerald-700">
                      Grade O
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 font-bold text-primary hover:bg-primary/5 rounded-lg"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <Eye className="h-4 w-4" /> View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !collectionLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No student records found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                <Badge variant="secondary" className="font-bold border-none">{bioData.quota}</Badge>
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
              No biographical profile has been recorded for this student yet.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}