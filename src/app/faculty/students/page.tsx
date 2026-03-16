'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Users, Filter, Eye, 
  ArrowUpRight, TrendingUp, BookOpen, Clock,
  MoreVertical, GraduationCap
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const MOCK_STUDENTS = [
  { id: 'S101', name: 'Alex Johnson', email: 'alex.j@college.edu', dept: 'Engineering', sem: '5', program: 'UG', attendance: 92, performance: 'O' },
  { id: 'S102', name: 'Sarah Miller', email: 'sarah.m@college.edu', dept: 'Engineering', sem: '5', program: 'UG', attendance: 98, performance: 'O' },
  { id: 'S103', name: 'James Wilson', email: 'james.w@college.edu', dept: 'Arts', sem: '3', program: 'UG', attendance: 85, performance: 'A+' },
  { id: 'S104', name: 'Emily Davis', email: 'emily.d@college.edu', dept: 'Science', sem: '1', program: 'PG', attendance: 78, performance: 'A' },
  { id: 'S105', name: 'Michael Chen', email: 'm.chen@college.edu', dept: 'Engineering', sem: '5', program: 'UG', attendance: 94, performance: 'A+' },
];

export default function StudentManagement() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [semFilter, setSemFilter] = useState('all');

  const filtered = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (deptFilter === 'all' || s.dept === deptFilter) &&
    (semFilter === 'all' || s.sem === semFilter)
  );

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
            <CardTitle className="text-2xl">{MOCK_STUDENTS.length}</CardTitle>
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
              <CardDescription className="text-purple-700 font-bold uppercase text-[10px] tracking-widest">Top Performers</CardDescription>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">42 Students</CardTitle>
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
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Arts">Arts & Design</SelectItem>
                  <SelectItem value="Science">Applied Sciences</SelectItem>
                </SelectContent>
              </Select>
              <Select value={semFilter} onValueChange={setSemFilter}>
                <SelectTrigger className="w-[140px] bg-slate-50 border-none h-11 rounded-xl">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>
                  ))}
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
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">#{student.id} • {student.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-600">{student.dept}</span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1 border-slate-200">
                          {student.program}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1 border-slate-200">
                          Sem {student.sem}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={cn(
                        "text-xs font-bold",
                        student.attendance >= 90 ? "text-emerald-600" : student.attendance >= 75 ? "text-amber-600" : "text-red-600"
                      )}>
                        {student.attendance}%
                      </span>
                      <Progress value={student.attendance} className="h-1 w-16 bg-slate-100" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-bold px-3 py-0.5 border-none",
                      student.performance === 'O' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      Grade {student.performance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary hover:bg-primary/5 rounded-lg">
                      <Eye className="h-4 w-4" /> View Profile
                    </Button>
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