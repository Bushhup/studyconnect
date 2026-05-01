'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, CheckCircle2, AlertCircle, 
  Search, Download, Clock, Filter, ChevronDown, 
  Loader2, XCircle, TrendingUp, Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  XAxis, YAxis, CartesianGrid, 
  AreaChart, Area
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const collegeId = 'study-connect-college';

const ATTENDANCE_CSV_COLUMNS: CsvColumn[] = [
  { key: 'studentId', label: 'Student ID', description: 'Institutional unique identifier.', example: 'alex.j@college.edu', required: true },
  { key: 'subjectId', label: 'Course ID', description: 'Academic course identifier.', example: 'course-ai402', required: true },
  { key: 'status', label: 'Presence Status', description: 'present, absent, or late.', example: 'present', required: true },
  { key: 'date', label: 'Date', description: 'YYYY-MM-DD format.', example: '2024-10-24', required: false },
];

export default function AttendancePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [search, setSearch] = useState('');

  // Fetch Current Profile for Scoping
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile } = useDoc(profileRef);

  const isHOD = profile?.role === 'hod';
  const myDeptId = profile?.departmentId;

  // Real data queries
  const recordsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'colleges', collegeId, 'academicRecords'), limit(100));
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'users');
    if (isHOD) {
      if (!myDeptId) return null; // Strict guard
      return query(base, where('departmentId', '==', myDeptId));
    }
    return base;
  }, [firestore, isHOD, myDeptId]);

  const coursesQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'courses'), [firestore]);

  const { data: allRecords, isLoading } = useCollection(recordsQuery);
  const { data: users } = useCollection(usersQuery);
  const { data: courses } = useCollection(coursesQuery);

  // Filter records by department users if HOD
  const records = allRecords?.filter(r => {
    if (!isHOD) return true;
    return users?.some(u => u.email === r.studentId);
  }) || [];

  const stats = {
    present: records?.filter(r => (r.attendance || 0) > 90).length || 0,
    atRisk: records?.filter(r => (r.attendance || 0) < 75).length || 0,
    average: Math.round((records?.reduce((acc, r) => acc + (r.attendance || 0), 0) || 0) / (records?.length || 1))
  };

  const handleExportTemplate = () => {
    const headers = ATTENDANCE_CSV_COLUMNS.map(c => c.key).join(',');
    const example = ATTENDANCE_CSV_COLUMNS.map(c => c.example).join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${example}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_ledger_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Template Exported', description: 'Follow the header format: ' + headers });
  };

  const filteredRecords = records?.filter(r => {
    const student = users?.find(u => u.email === r.studentId);
    const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  }) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">
            {isHOD ? 'Departmental Attendance' : 'Attendance Hub'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isHOD ? `Monitoring presence for ${myDeptId?.replace('dept-', '').toUpperCase()}.` : 'Cross-departmental presence monitoring and threshold alerts.'}
          </p>
        </motion.div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Import Presence Logs"
            description="Process daily attendance mapping."
            columns={ATTENDANCE_CSV_COLUMNS}
          />
          <Button variant="outline" className="gap-2 shadow-sm rounded-full bg-card" onClick={handleExportTemplate}>
            <Download className="h-4 w-4" /> Export Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-emerald-600">Avg Presence</CardDescription>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-bold">{stats.average}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.average} className="h-1.5 bg-muted" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-amber-600">Threshold Alerts</CardDescription>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-3xl font-bold">{stats.atRisk}</CardTitle>
          </CardHeader>
          <CardContent>
             <Progress value={20} className="h-1.5 bg-muted" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b pb-6">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter student roster..." className="pl-10 bg-muted border-none h-11 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="font-bold pl-6 py-4">Student Identity</TableHead>
                  <TableHead className="font-bold">Subject / Unit</TableHead>
                  <TableHead className="font-bold text-center">Current Rate</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((row) => {
                  const student = users?.find(u => u.email === row.studentId);
                  const course = courses?.find(c => c.id === row.subjectId);
                  return (
                    <TableRow key={row.id} className="group hover:bg-muted/30 border-border">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">
                                {student?.firstName?.[0]}{student?.lastName?.[0]}
                              </AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="font-bold text-sm text-foreground">{student?.firstName} {student?.lastName}</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">{student?.email}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{course?.name || row.subjectId}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("text-xs font-bold", row.attendance < 75 ? "text-red-500" : "text-emerald-600")}>{row.attendance}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "uppercase text-[8px] font-bold border-none px-2",
                          row.attendance >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        )}>
                          {row.attendance >= 75 ? 'Compliant' : 'Shortage'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="text-primary font-bold uppercase text-[9px] rounded-lg h-8 hover:bg-primary/5">Details</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-24 text-center text-muted-foreground italic">No attendance records found matching your search.</TableCell>
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
