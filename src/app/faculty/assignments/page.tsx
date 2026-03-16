'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Briefcase, Calendar, Clock, 
  Users, CheckCircle2, AlertCircle, FileText,
  MoreVertical, Filter, Loader2, Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const MOCK_ASSIGNMENTS = [
  { id: '1', title: 'Neural Network Implementation', subject: 'Machine Learning', sem: '5', deadline: 'Oct 30, 2024', submissions: 32, total: 42, status: 'Active' },
  { id: '2', title: 'Big Data Pipeline Architecture', subject: 'Data Science', sem: '2', deadline: 'Nov 05, 2024', submissions: 12, total: 18, status: 'Active' },
  { id: '3', title: 'Graph Algorithm Analysis', subject: 'Advanced Algorithms', sem: '5', deadline: 'Oct 20, 2024', submissions: 38, total: 38, status: 'Closed' },
];

export default function AssignmentManagement() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      toast({ title: 'Assignment Published', description: 'Students have been notified via the portal.' });
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Course Assignments</h1>
          <p className="text-muted-foreground mt-1">Create, manage, and grade student task submissions.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-6">
              <Plus className="h-4 w-4" /> Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Academic Task</DialogTitle>
              <DialogDescription>Define objectives and set deadlines for your students.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Assignment Title</Label>
                <Input placeholder="e.g. Implementation of A* Search" className="bg-slate-50 border-none h-11" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Subject</Label>
                  <Select required>
                    <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Machine Learning</SelectItem>
                      <SelectItem value="ds">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Submission Deadline</Label>
                  <Input type="date" className="bg-slate-50 border-none h-11" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Description & Requirements</Label>
                <Textarea placeholder="Detail the submission requirements..." className="bg-slate-50 border-none min-h-[120px]" required />
              </div>
              <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight shadow-lg shadow-primary/20 mt-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                Publish Assignment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ASSIGNMENTS.map((item) => (
          <Card key={item.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className={cn(
                  "text-[9px] font-bold uppercase border-none",
                  item.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {item.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-headline mt-2 group-hover:text-primary transition-colors">{item.title}</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.subject} • Sem {item.sem}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Due: {item.deadline}
                </div>
                <Badge className="bg-white text-primary border-slate-100 text-[10px] font-bold">
                  {item.submissions} Submissions
                </Badge>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Submission Progress</span>
                  <span>{Math.round((item.submissions / item.total) * 100)}%</span>
                </div>
                <Progress value={(item.submissions / item.total) * 100} className="h-1.5 bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="rounded-xl h-10 text-[10px] font-bold uppercase gap-2">
                  <Users className="h-3.5 w-3.5" /> Submissions
                </Button>
                <Button variant="ghost" className="rounded-xl h-10 text-[10px] font-bold uppercase gap-2 hover:bg-primary/5 text-primary">
                  <FileText className="h-3.5 w-3.5" /> Grade All
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}