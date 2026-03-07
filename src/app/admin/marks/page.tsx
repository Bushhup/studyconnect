
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileSpreadsheet, Download, Send, AlertCircle } from 'lucide-react';

export default function MarksManagementPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Grading & Assessment</h1>
          <p className="text-muted-foreground mt-1">Record student marks, generate transcripts, and verify GPA calculations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
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
              <Input placeholder="Search by student name or ID..." className="pl-10 bg-slate-50 border-none" />
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
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4 pl-6 font-mono text-xs">#STU-00{i}A9</TableCell>
                  <TableCell className="font-bold">Alexander Wright</TableCell>
                  <TableCell>Introduction to AI</TableCell>
                  <TableCell className="text-center font-bold">88 / 100</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">A</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400">Verified</Badge>
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
