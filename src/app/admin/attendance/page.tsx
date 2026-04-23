'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
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

const weeklyData = [
  { label: 'Mon', engineering: 92, arts: 85, management: 88 },
  { label: 'Tue', engineering: 95, arts: 87, management: 90 },
  { label: 'Wed', engineering: 94, arts: 84, management: 89 },
  { label: 'Thu', engineering: 91, arts: 82, management: 86 },
  { label: 'Fri', engineering: 89, arts: 80, management: 85 },
];

export default function AttendancePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [search, setSearch] = useState('');

  // Real data queries
  const recordsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'colleges', collegeId, 'academicRecords'), limit(50));
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'users'), [firestore]);
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'courses'), [firestore]);

  const { data: records, isLoading } = useCollection(recordsQuery);
  const { data: users } = useCollection(usersQuery);
  const { data: courses } = useCollection(coursesQuery);

  const stats = {
    present: records?.filter(r => r.attendance > 90).length || 0,
    atRisk: records?.filter(r => r.attendance < 75).length || 0,
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
    const student = users?.find(u => u.id === r.studentId);
    const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  }) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Attendance Hub</h1>
          <p className="text-muted-foreground mt-1">Cross-departmental presence monitoring and threshold alerts.</p>
        </motion.div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Import Presence Logs"
            description="Process daily attendance mapping for a department."
            columns={ATTENDANCE_CSV_COLUMNS}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm rounded-full bg-card" onClick={handleExportTemplate}>
                  <Download className="h-4 w-4" /> Export Template
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white rounded-xl p-3 max-w-xs">
                <p className="text-[10px] font-bold uppercase mb-1">Required Headers</p>
                <code className="text-[9px] break-all">{ATTENDANCE_CSV_COLUMNS.map(c => c.key).join(', ')}</code>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-emerald-600">Global Average</CardDescription>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-bold">{stats.average}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.average} className="h-1.5 bg-muted" />
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Verified for {records?.length || 0} active records</p>
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
             <p className="text-[10px] text-muted-foreground mt-2 font-medium">Students below institutional 75% mandate</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-blue-600">Late Registry</CardDescription>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-3xl font-bold">12</CardTitle>
          </CardHeader>
          <CardContent>
             <Progress value={10} className="h-1.5 bg-muted" />
             <p className="text-[10px] text-muted-foreground mt-2 font-medium">Incident flags raised this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-card overflow-hidden rounded-[2.5rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline">Departmental Trends</CardTitle>
              <CardDescription>Comparative comparative analysis for current semester.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary">Engineering</Badge>
              <Badge variant="outline" className="text-[8px] font-bold border-purple-200 text-purple-600">Management</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ChartContainer config={{ engineering: { label: 'Eng', color: 'hsl(var(--primary))' }, management: { label: 'Mgmt', color: 'hsl(var(--chart-2))' } }}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="engineering" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                <Area type="monotone" dataKey="management" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card rounded-[2rem]">
           <CardHeader>
              <CardTitle className="text-lg font-headline">Quick Actions</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="p-6 bg-slate-900 text-white rounded-[1.5rem] space-y-4 relative overflow-hidden">
                <TrendingUp className="absolute right-[-10px] bottom-[-10px] h-20 w-20 opacity-5 -rotate-12" />
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">Performance Audit</p>
                <h3 className="text-lg font-bold leading-tight">Run institutional attendance audit for Q1</h3>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-10">Initialize Audit</Button>
              </div>
              <Button onClick={() => toast({ title: 'Alerts Dispatched', description: 'Warning emails sent to all at-risk students.' })} variant="outline" className="w-full h-12 rounded-xl font-bold uppercase text-[10px] border-amber-200 text-amber-600 hover:bg-amber-50">
                Bulk Notify At-Risk Students
              </Button>
           </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter student roster..." className="pl-10 bg-muted border-none h-11 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <Button variant="ghost" className="gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full px-6">
               Live Sync <Activity className="h-3 w-3 animate-pulse" />
            </Button>
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
                  <TableHead className="font-bold">Compliance Status</TableHead>
                  <TableHead className="text-right pr-6 font-bold">Registry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((row) => {
                  const student = users?.find(u => u.id === row.studentId);
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
                        <p className="text-[9px] font-mono text-muted-foreground uppercase">{course?.code}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn("text-xs font-bold", row.attendance < 75 ? "text-red-500" : "text-emerald-600")}>{row.attendance}%</span>
                          <Progress value={row.attendance} className="h-1 w-12" />
                        </div>
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
                        <Button variant="ghost" size="sm" className="text-primary font-bold uppercase text-[9px] rounded-lg h-8 hover:bg-primary/5">View History</Button>
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