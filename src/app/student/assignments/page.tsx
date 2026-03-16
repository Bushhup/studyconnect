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
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage course assignments, track deadlines, and view feedback.</p>
        </div>
        <Button variant="outline" className="rounded-full gap-2 border-slate-200 shadow-sm bg-white h-11 px-6">
          <History className="h-4 w-4" /> Submission History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSIGNMENTS.map((item) => (
          <Card key={item.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden group flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge className={cn(
                  "text-[9px] font-bold uppercase border-none px-2",
                  item.status === 'Pending' ? "bg-amber-50 text-amber-700" :
                  item.status === 'Completed' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                )}>
                  {item.status}
                </Badge>
                {item.grade && (
                  <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">Grade: {item.grade}</Badge>
                )}
              </div>
              <CardTitle className="text-lg font-headline mt-3 group-hover:text-primary transition-colors">{item.title}</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.subject}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
              
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Due: {item.deadline}
                </div>
                {item.status === 'Pending' && (
                  <span className="text-[9px] font-bold text-amber-600 uppercase">2 Days Left</span>
                )}
              </div>
            </CardContent>
            <CardContent className="pt-0 pb-6">
              <Dialog open={!!selectedTask && selectedTask.id === item.id} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full rounded-xl gap-2 font-bold text-xs h-11 shadow-lg shadow-primary/10"
                    onClick={() => setSelectedTask(item)}
                    disabled={item.status === 'Completed'}
                  >
                    {item.status === 'Pending' ? (
                      <><Upload className="h-4 w-4" /> Submit Assignment</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> View Submission</>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{item.title}</DialogTitle>
                    <DialogDescription>Submit your work for {item.subject} before the deadline.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-6 pt-4">
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Task Objective</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border-slate-200">
                        <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-600">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-slate-400 mt-1">PDF, ZIP or DOCX (Max 10MB)</p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
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
