'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, FileSpreadsheet, Download, Send, 
  AlertCircle, Loader2, TrendingUp, Trophy,
  Star, ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts';

const collegeId = 'study-connect-college';

const chartData = [
  { name: 'Unit 1', avg: 72 },
  { name: 'Unit 2', avg: 78 },
  { name: 'Midterm', avg: 85 },
  { name: 'Unit 3', avg: 82 },
  { name: 'Finals', avg: 88 },
];

export default function MarksManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const students = users?.filter(u => 
    u.role === 'student' && 
    (`${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Grading</h1>
          <p className="text-muted-foreground mt-1">Manage assessment results, grade distribution, and institutional rankings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm rounded-full" onClick={() => toast({ title: "Export Started", description: "Generating grade report..." })}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full px-6" onClick={() => toast({ title: "Portal Sync", description: "Grades published to all student portals." })}>
            <Send className="h-4 w-4" /> Publish Results
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Semester Performance Trend</CardTitle>
              <CardDescription>Average score progression across all subjects</CardDescription>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold gap-1.5 py-1">
              <TrendingUp className="h-3 w-3" /> +5.2% Growth
            </Badge>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
            <Trophy className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12" />
            <CardHeader className="pb-2">
               <CardDescription className="text-white/70 font-bold uppercase text-[10px] tracking-widest">Class Leader</CardDescription>
               <CardTitle className="text-2xl">Sarah Miller</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-2 text-3xl font-bold">
                 98.4 <span className="text-sm font-medium text-white/70">GPA 4.0</span>
               </div>
               <p className="text-[10px] text-white/60 mt-2 font-medium">Top Rank • Computer Science Dept.</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['A', 'B', 'C'].map((grade, i) => (
                <div key={grade} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>Grade {grade}</span>
                    <span className="text-slate-400">{45 - (i * 10)}%</span>
                  </div>
                  <Progress value={45 - (i * 10)} className="h-1 bg-slate-100" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter by student name or ID..." 
                className="pl-10 bg-slate-50 border-none h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3 py-1">Batch of 2026</Badge>
               <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3 py-1">Semester 4</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-bold pl-6 py-4">Student Name</TableHead>
                <TableHead className="font-bold">Progress Track</TableHead>
                <TableHead className="font-bold text-center">Final Score</TableHead>
                <TableHead className="font-bold">Grade Badge</TableHead>
                <TableHead className="font-bold">Ranking</TableHead>
                <TableHead className="text-right pr-6 font-bold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : students?.map((student, idx) => {
                const score = 100 - (idx * 3) - Math.floor(Math.random() * 5);
                const grade = score > 90 ? 'A+' : score > 80 ? 'A' : score > 70 ? 'B' : 'C';
                
                return (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 border-slate-100 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                        <span className="text-[10px] font-mono text-slate-400">#{student.id.substring(0, 6).toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 space-y-1.5">
                        <Progress value={score} className={cn(
                          "h-1.5",
                          score > 90 ? "bg-emerald-100" : "bg-blue-100"
                        )} />
                        <span className="text-[9px] font-bold text-slate-400">Consistency: High</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{score} / 100</span>
                        <span className="text-[9px] text-muted-foreground uppercase">Average Performance</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-bold px-3 py-0.5 border-none",
                        grade.startsWith('A') ? "bg-emerald-100 text-emerald-700" :
                        grade.startsWith('B') ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {idx < 3 ? (
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                          <Star className="h-3.5 w-3.5 fill-current" /> Top {idx + 1}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Above Avg</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
