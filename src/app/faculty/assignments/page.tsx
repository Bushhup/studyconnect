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
import { Progress } from '@/components/ui/progress';
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
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Course Assignments</h1>
          <p className="text-muted-foreground mt-1">Create, manage, and grade student task submissions.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-6 font-bold">
              <Plus className="h-4 w-4" /> Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] max-w-2xl border-none shadow-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">New Academic Task</DialogTitle>
              <DialogDescription className="text-base">Define objectives and set deadlines for your students.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Assignment Title</Label>
                <Input placeholder="e.g. Implementation of A* Search" className="bg-muted border-none h-12 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</Label>
                  <Select required>
                    <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Machine Learning</SelectItem>
                      <SelectItem value="ds">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Submission Deadline</Label>
                  <Input type="date" className="bg-muted border-none h-12 rounded-xl" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description & Requirements</Label>
                <Textarea placeholder="Detail the submission requirements..." className="bg-muted border-none min-h-[120px] rounded-xl resize-none" required />
              </div>
              <Button type="submit" className="w-full h-14 font-bold uppercase tracking-tight shadow-lg shadow-primary/20 mt-4 rounded-xl text-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                Publish Assignment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ASSIGNMENTS.map((item) => (
          <Card key={item.id} className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden group flex flex-col hover:shadow-md transition-all">
            <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className={cn(
                  "text-[9px] font-bold uppercase border-none px-3 h-5 flex items-center",
                  item.status === 'Active' ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                )}>
                  {item.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-primary">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-headline mt-3 group-hover:text-primary transition-colors text-foreground">{item.title}</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{item.subject} • Sem {item.sem}</p>
            </CardHeader>
            <CardContent className="space-y-5 flex-grow">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-transparent group-hover:border-primary/5 transition-all">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  <Clock className="h-4 w-4 text-primary opacity-60" />
                  Due: <span className="text-foreground">{item.deadline}</span>
                </div>
                <Badge className="bg-card text-primary border-primary/20 text-[9px] font-bold h-5 uppercase">
                  {item.submissions} Subs
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Submission Rate</span>
                  <span className="text-foreground">{Math.round((item.submissions / item.total) * 100)}%</span>
                </div>
                <Progress value={(item.submissions / item.total) * 100} className="h-1 bg-muted shadow-none" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" className="rounded-xl h-11 text-[10px] font-bold uppercase gap-2 bg-transparent border-border group-hover:border-primary/20">
                  <Users className="h-4 w-4 opacity-60" /> Submissions
                </Button>
                <Button variant="ghost" className="rounded-xl h-11 text-[10px] font-bold uppercase gap-2 hover:bg-primary/10 text-primary bg-primary/5 border-none">
                  <FileText className="h-4 w-4" /> Grade All
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
