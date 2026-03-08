
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileSpreadsheet, Download, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const collegeId = 'study-connect-college';

export default function MarksManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users to filter students
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  // Filter for students based on role and search query
  const students = users?.filter(u => 
    u.role === 'student' && 
    (`${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Preparing your institutional marks report as CSV...",
    });
  };

  const handlePublish = () => {
    toast({
      title: "Results Published",
      description: "Final semester grades have been synchronized with student portals.",
    });
  };

  const handleVerify = (name: string) => {
    toast({
      title: "Mark Verified",
      description: `Academic record for ${name} has been confirmed.`,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Grading & Assessment</h1>
          <p className="text-muted-foreground mt-1">Record student marks, generate transcripts, and verify GPA calculations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handlePublish}>
            <Send className="h-4 w-4" /> Publish Results
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
           <p className="text-sm font-bold text-amber-800 uppercase tracking-tight">End Semester Review Pending</p>
           <p className="text-xs text-amber-700">12 faculty members have not yet submitted their final assessment reports. Verification is required before publication.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by student name or ID..." 
                className="pl-10 bg-slate-50 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-bold text-slate-600">Batch of 2026 • Sem 4</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold py-4 pl-6">Student ID</TableHead>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Course</TableHead>
                <TableHead className="font-bold text-center">Score</TableHead>
                <TableHead className="font-bold">Grade</TableHead>
                <TableHead className="text-right font-bold pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : students?.map((student) => {
                // Mocking scores and grades for dynamic UI display
                const score = Math.floor(Math.random() * 30) + 70;
                let grade = 'A';
                if (score < 85) grade = 'B';
                if (score < 75) grade = 'C';

                return (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 pl-6 font-mono text-xs">
                      #{student.id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-bold">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>Introduction to AI</TableCell>
                    <TableCell className="text-center font-bold">{score} / 100</TableCell>
                    <TableCell>
                      <Badge className={
                        grade === 'A' ? "bg-emerald-100 text-emerald-700 border-none font-bold" :
                        grade === 'B' ? "bg-blue-100 text-blue-700 border-none font-bold" :
                        "bg-amber-100 text-amber-700 border-none font-bold"
                      }>
                        {grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] uppercase font-bold text-primary hover:text-primary-foreground hover:bg-primary transition-all rounded-full h-7"
                        onClick={() => handleVerify(`${student.firstName} ${student.lastName}`)}
                      >
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && students?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <p>No student records found matching your query.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
