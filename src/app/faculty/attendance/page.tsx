'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, ClipboardCheck, Calendar, Users, 
  CheckCircle2, XCircle, Clock, Filter,
  ArrowLeft, ChevronRight, Save
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MOCK_STUDENTS = [
  { id: 'S101', name: 'Alex Johnson', regNo: '2024CS01', status: 'present' },
  { id: 'S102', name: 'Sarah Miller', regNo: '2024CS02', status: 'present' },
  { id: 'S103', name: 'James Wilson', regNo: '2024CS03', status: 'absent' },
  { id: 'S104', name: 'Emily Davis', regNo: '2024CS04', status: 'present' },
  { id: 'S105', name: 'Michael Chen', regNo: '2024CS05', status: 'late' },
];

export default function FacultyAttendance() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('cse-a');
  const [degree, setDegree] = useState('ug');
  const [semester, setSemester] = useState('5');
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState(MOCK_STUDENTS);

  const handleToggleStatus = (id: string, newStatus: string) => {
    setAttendance(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleSave = () => {
    toast({
      title: 'Attendance Recorded',
      description: `Data for ${selectedClass.toUpperCase()} (Sem ${semester}) has been synchronized.`,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Record Attendance</h1>
          <p className="text-muted-foreground mt-1">Mark student presence for your current academic session.</p>
        </div>
        <Button onClick={handleSave} className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-8">
          <Save className="h-4 w-4" /> Save Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Program</label>
          <Select value={degree} onValueChange={setDegree}>
            <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ug">Undergraduate (UG)</SelectItem>
              <SelectItem value="pg">Postgraduate (PG)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Semester</label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subject / Section</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cse-a">Machine Learning - Section A</SelectItem>
              <SelectItem value="cse-b">Machine Learning - Section B</SelectItem>
              <SelectItem value="ds-a">Data Science - Section A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter students..." 
                  className="pl-10 bg-slate-50 border-none h-11 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Marked Present</p>
                  <p className="text-sm font-bold text-emerald-600">{attendance.filter(s => s.status === 'present').length} / {attendance.length}</p>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <Button variant="outline" size="sm" className="rounded-full h-8 text-[10px] font-bold uppercase">Mark All Present</Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {attendance.map((student) => (
              <div key={student.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{student.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{student.regNo}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {[
                    { val: 'present', label: 'Present', icon: CheckCircle2, activeClass: 'bg-emerald-100 text-emerald-700' },
                    { val: 'absent', label: 'Absent', icon: XCircle, activeClass: 'bg-red-100 text-red-700' },
                    { val: 'late', label: 'Late', icon: Clock, activeClass: 'bg-amber-100 text-amber-700' },
                  ].map((btn) => (
                    <Button
                      key={btn.val}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(student.id, btn.val)}
                      className={cn(
                        "h-9 px-4 rounded-xl gap-2 font-bold text-[10px] uppercase border transition-all",
                        student.status === btn.val 
                          ? cn("border-transparent shadow-sm", btn.activeClass) 
                          : "border-slate-100 text-slate-400 bg-transparent hover:bg-slate-50"
                      )}
                    >
                      <btn.icon className="h-3.5 w-3.5" />
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
