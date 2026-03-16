'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, FileSpreadsheet, Send, Trophy,
  GraduationCap, TrendingUp, Award, Edit3,
  CheckCircle2, AlertCircle, Save
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MOCK_GRADES = [
  { id: 'S101', name: 'Alex Johnson', cat1: 42, cat2: 45, model: 88, final: 0 },
  { id: 'S102', name: 'Sarah Miller', cat1: 48, cat2: 49, model: 94, final: 0 },
  { id: 'S103', name: 'James Wilson', cat1: 35, cat2: 38, model: 72, final: 0 },
  { id: 'S104', name: 'Emily Davis', cat1: 44, cat2: 42, model: 85, final: 0 },
  { id: 'S105', name: 'Michael Chen', cat1: 38, cat2: 40, model: 78, final: 0 },
];

export default function FacultyMarks() {
  const { toast } = useToast();
  const [assessmentType, setAssessmentType] = useState('cat1');
  const [selectedClass, setSelectedClass] = useState('cse-a');
  const [semester, setSemester] = useState('5');
  const [grades, setGrades] = useState(MOCK_GRADES);

  const handleUpdateMark = (id: string, field: string, val: string) => {
    const numVal = parseInt(val) || 0;
    setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: numVal } : g));
  };

  const handlePublish = () => {
    toast({
      title: 'Results Published',
      description: 'The selected assessment marks are now visible to students.',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Grading</h1>
          <p className="text-muted-foreground mt-1">Assign marks and manage institutional academic results.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full h-11 px-6">Export Ledger</Button>
           <Button onClick={handlePublish} className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-8">
             <Send className="h-4 w-4" /> Publish Results
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white p-6 rounded-[2rem] flex flex-col justify-between">
          <div className="space-y-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Assessment Phase</label>
                <Select value={assessmentType} onValueChange={setAssessmentType}>
                  <SelectTrigger className="bg-slate-50 border-none shadow-none rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat1">CAT-1 (Max 50)</SelectItem>
                    <SelectItem value="cat2">CAT-2 (Max 50)</SelectItem>
                    <SelectItem value="model">Model Exam (Max 100)</SelectItem>
                    <SelectItem value="final">Final Exam (Max 100)</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subject & Semester</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-slate-50 border-none shadow-none rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cse-a">Machine Learning (Sem 5)</SelectItem>
                    <SelectItem value="ds-a">Data Science (Sem 5)</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
          <div className="pt-6 border-t border-dashed mt-6">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-2xl">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Class Avg</p>
                  <p className="text-xl font-bold">41.4 / 50</p>
                </div>
             </div>
          </div>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
             <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-headline">Grade Ledger</CardTitle>
                <Badge variant="outline" className="border-primary/20 text-primary font-bold px-3">Sync Status: Active</Badge>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
               <TableHeader className="bg-slate-50/20">
                 <TableRow className="border-none hover:bg-transparent">
                   <TableHead className="font-bold pl-6 py-4">Student Name</TableHead>
                   <TableHead className="font-bold text-center">CAT-1</TableHead>
                   <TableHead className="font-bold text-center">CAT-2</TableHead>
                   <TableHead className="font-bold text-center">Model</TableHead>
                   <TableHead className="font-bold text-center">Final</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {grades.map((row) => (
                   <TableRow key={row.id} className="group hover:bg-slate-50/50 border-slate-100">
                     <TableCell className="pl-6 py-4">
                       <p className="text-sm font-bold text-slate-800">{row.name}</p>
                       <p className="text-[10px] font-mono text-muted-foreground">#{row.id}</p>
                     </TableCell>
                     <TableCell className="text-center">
                       <Input 
                        type="number" 
                        value={row.cat1} 
                        onChange={(e) => handleUpdateMark(row.id, 'cat1', e.target.value)}
                        className="w-16 mx-auto h-9 text-center bg-slate-50 border-none font-bold" 
                       />
                     </TableCell>
                     <TableCell className="text-center">
                        <Input 
                        type="number" 
                        value={row.cat2} 
                        onChange={(e) => handleUpdateMark(row.id, 'cat2', e.target.value)}
                        className="w-16 mx-auto h-9 text-center bg-slate-50 border-none font-bold" 
                       />
                     </TableCell>
                     <TableCell className="text-center">
                        <Input 
                        type="number" 
                        value={row.model} 
                        onChange={(e) => handleUpdateMark(row.id, 'model', e.target.value)}
                        className="w-16 mx-auto h-9 text-center bg-slate-50 border-none font-bold" 
                       />
                     </TableCell>
                     <TableCell className="text-center">
                        <Input 
                        type="number" 
                        value={row.final} 
                        onChange={(e) => handleUpdateMark(row.id, 'final', e.target.value)}
                        className="w-16 mx-auto h-9 text-center bg-slate-50 border-none font-bold" 
                       />
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
