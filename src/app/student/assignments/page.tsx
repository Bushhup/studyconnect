'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, Calendar, Clock, CheckCircle2, 
  AlertCircle, Upload, History, ExternalLink,
  ChevronRight, FileText, Filter, Loader2, Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ASSIGNMENTS = [
  { id: '1', title: 'Neural Networks Implementation', subject: 'Machine Learning', deadline: 'Oct 30, 2024', status: 'Pending', grade: null, desc: 'Implement a multi-layer perceptron from scratch using only NumPy.' },
  { id: '2', title: 'Big Data Pipeline Architecture', subject: 'Data Science', deadline: 'Nov 05, 2024', status: 'In Review', grade: null, desc: 'Design a scalable ETL pipeline for processing 1TB of log data daily.' },
  { id: '3', title: 'Graph Algorithm Analysis', subject: 'Advanced Algorithms', deadline: 'Oct 20, 2024', status: 'Completed', grade: 'O', desc: 'Analysis of time and space complexity for Dijkstra and A* search.' },
];

export default function StudentAssignments() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedTask(null);
      toast({ title: 'Submission Received', description: 'Your academic task has been recorded for review.' });
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Academic Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage course assignments, track deadlines, and view feedback.</p>
        </div>
        <Button variant="outline" className="rounded-full gap-2 border-border shadow-sm bg-card h-11 px-6 font-bold">
          <History className="h-4 w-4" /> Submission History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSIGNMENTS.map((item) => (
          <Card key={item.id} className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden group flex flex-col hover:shadow-md transition-all">
            <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge className={cn(
                  "text-[9px] font-bold uppercase border-none px-3 h-5 flex items-center",
                  item.status === 'Pending' ? "bg-amber-500/10 text-amber-600" :
                  item.status === 'Completed' ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                )}>
                  {item.status}
                </Badge>
                {item.grade && (
                  <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary uppercase h-5">Grade: {item.grade}</Badge>
                )}
              </div>
              <CardTitle className="text-lg font-headline mt-3 group-hover:text-primary transition-colors text-foreground">{item.title}</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{item.subject}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-body">{item.desc}</p>
              
              <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between border border-transparent group-hover:border-primary/5 transition-all">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  <Clock className="h-4 w-4 text-primary opacity-60" />
                  Due: <span className="text-foreground">{item.deadline}</span>
                </div>
                {item.status === 'Pending' && (
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">2 Days Left</span>
                )}
              </div>
            </CardContent>
            <CardContent className="pt-0 pb-8">
              <Dialog open={!!selectedTask && selectedTask.id === item.id} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full rounded-xl gap-2 font-bold text-xs h-12 shadow-lg shadow-primary/10 uppercase tracking-widest"
                    onClick={() => setSelectedTask(item)}
                    disabled={item.status === 'Completed'}
                  >
                    {item.status === 'Pending' ? (
                      <><Upload className="h-4 w-4" /> Submit Task</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> View Submission</>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] max-w-xl border-none shadow-2xl bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold">{item.title}</DialogTitle>
                    <DialogDescription className="text-base">Submit your work for {item.subject} before the deadline.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-6 pt-4">
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Task Objective</p>
                      <p className="text-sm text-foreground leading-relaxed font-body">{item.desc}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="border-2 border-dashed rounded-[2rem] p-12 text-center bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer border-border group/upload">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3 group-hover/upload:text-primary transition-colors" />
                        <p className="text-sm font-bold text-foreground">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">PDF, ZIP or DOCX (Max 10MB)</p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-14 font-bold uppercase tracking-tight text-lg shadow-xl shadow-primary/20 rounded-xl" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                      Confirm Final Submission
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
