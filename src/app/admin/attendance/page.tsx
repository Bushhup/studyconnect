'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Users, CheckCircle2, AlertCircle, 
  Search, Download, TrendingUp, XCircle, 
  Clock, Filter, ChevronDown, FileSpreadsheet
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
import { cn } from '@/lib/utils';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const ATTENDANCE_CSV_COLUMNS: CsvColumn[] = [
  { key: 'studentId', label: 'Student ID', description: 'Institutional unique identifier.', example: 'S-101', required: true },
  { key: 'subject', label: 'Subject', description: 'Academic course name.', example: 'Algorithms 101', required: true },
  { key: 'date', label: 'Date', description: 'Presence date (YYYY-MM-DD).', example: '2024-10-24', required: true },
  { key: 'status', label: 'Status', description: 'present, absent, or late.', example: 'present', required: true },
];

const weeklyData = [
  { label: 'Mon', engineering: 92, management: 88, arts: 85, science: 94 },
  { label: 'Tue', engineering: 95, management: 90, arts: 87, science: 96 },
  { label: 'Wed', engineering: 94, management: 89, arts: 84, science: 95 },
  { label: 'Thu', engineering: 91, management: 86, arts: 82, science: 92 },
  { label: 'Fri', engineering: 89, management: 85, arts: 80, science: 90 },
  { label: 'Sat', engineering: 85, management: 80, arts: 75, science: 88 },
  { label: 'Sun', engineering: 82, management: 78, arts: 72, science: 85 },
];

const mockAttendance = [
  { id: '1', name: 'Alex Johnson', date: 'Oct 24, 2024', status: 'present', subject: 'Machine Learning' },
  { id: '2', name: 'Sarah Miller', date: 'Oct 24, 2024', status: 'absent', subject: 'Machine Learning' },
  { id: '3', name: 'James Wilson', date: 'Oct 24, 2024', status: 'late', subject: 'Algorithms 101' },
  { id: '4', name: 'Emily Davis', date: 'Oct 24, 2024', status: 'present', subject: 'UI/UX Design' },
  { id: '5', name: 'Michael Chen', date: 'Oct 24, 2024', status: 'present', subject: 'Physics Lab' },
];

const chartConfig = {
  engineering: { label: "Engineering", color: "hsl(var(--chart-1))" },
  management: { label: "Management", color: "hsl(var(--chart-2))" },
  arts: { label: "Arts & Design", color: "hsl(var(--chart-3))" },
  science: { label: "Applied Sciences", color: "hsl(var(--chart-4))" },
};

export default function AttendancePage() {
  const [timeRange, setTimeRange] = useState('weekly');
  const [subjectFilter, setSubjectFilter] = useState('all');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Attendance Insights</h1>
          <p className="text-muted-foreground mt-1">Real-time institutional attendance trends and detailed logs.</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Import Presence Logs"
            description="Process daily attendance for a whole department by uploading a CSV log."
            columns={ATTENDANCE_CSV_COLUMNS}
          />
           <Button variant="outline" className="gap-2 shadow-sm rounded-full bg-card">
            <Download className="h-4 w-4" /> Export Data
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full px-6">
            <Calendar className="h-4 w-4" /> View Full Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm overflow-hidden bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest">Today's Presence</CardDescription>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-bold">94.2%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={94.2} className="h-1.5 bg-muted" />
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">4,520 Students marked present</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm overflow-hidden bg-card">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest">At-Risk Alerts</CardDescription>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-3xl font-bold">128</CardTitle>
          </CardHeader>
          <CardContent>
             <Progress value={20} className="h-1.5 bg-muted" />
             <p className="text-[10px] text-muted-foreground mt-2 font-medium">Students under 75% threshold</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm overflow-hidden bg-card">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[10px] tracking-widest">Late Entries</CardDescription>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-3xl font-bold">42</CardTitle>
          </CardHeader>
          <CardContent>
             <Progress value={10} className="h-1.5 bg-muted" />
             <p className="text-[10px] text-muted-foreground mt-2 font-medium">Reported in the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline">Departmental Trends</CardTitle>
              <CardDescription>Comparative data for current semester</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-muted border-none h-9 text-xs">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="engineering" stroke="var(--color-engineering)" fill="var(--color-engineering)" fillOpacity={0.1} />
                <Area type="monotone" dataKey="management" stroke="var(--color-management)" fill="var(--color-management)" fillOpacity={0.1} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card">
           <CardHeader>
              <CardTitle className="text-lg">Recent Logs</CardTitle>
              <CardDescription>Last entries from all sections</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              {mockAttendance.slice(0, 4).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{log.name}</span>
                    <span className="text-[10px] text-muted-foreground">{log.subject}</span>
                  </div>
                  <Badge className={cn(
                    "uppercase text-[9px] font-bold border-none",
                    log.status === 'present' ? "bg-emerald-500/10 text-emerald-500" :
                    log.status === 'absent' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {log.status}
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs font-bold text-primary">View Detailed Logs</Button>
           </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-10 bg-muted border-none h-10" />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px] bg-muted border-none h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All Subjects" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="algo">Algorithms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" className="gap-2 text-xs font-bold">
               Oct 24, 2024 <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-bold pl-6">Student Name</TableHead>
                <TableHead className="font-bold">Subject</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Status Indicator</TableHead>
                <TableHead className="text-right font-bold pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendance.map((row) => (
                <TableRow key={row.id} className="group hover:bg-muted/30 border-border">
                  <TableCell className="font-bold pl-6 text-foreground">{row.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">{row.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-full",
                        row.status === 'present' ? "bg-emerald-500/10 text-emerald-500" :
                        row.status === 'absent' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {row.status === 'present' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                         row.status === 'absent' ? <XCircle className="h-3.5 w-3.5" /> : 
                         <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-xs font-bold capitalize text-foreground">{row.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Edit Entry</Button>
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
