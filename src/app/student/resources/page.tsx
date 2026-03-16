'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, Search, Folder, 
  Clock, Share2, Filter, Layers,
  ExternalLink, PlayCircle, BookCopy,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const RESOURCES = [
  { id: 'r1', name: 'ML Unit 1 - Supervised Learning', subject: 'Machine Learning', type: 'PDF', size: '2.4 MB', faculty: 'Dr. Sarah Smith', date: 'Oct 12, 2024' },
  { id: 'r2', name: 'Algorithm Complexity Notes', subject: 'Advanced Algorithms', type: 'DOCX', size: '1.1 MB', faculty: 'Prof. James Wilson', date: 'Oct 15, 2024' },
  { id: 'r3', name: 'Physics Lab Manual v2', subject: 'Applied Physics', type: 'PDF', size: '4.8 MB', faculty: 'Dr. Emily Davis', date: 'Sep 28, 2024' },
  { id: 'r4', name: 'Lecture 05: Video Recap', subject: 'Machine Learning', type: 'VIDEO', size: '42 mins', faculty: 'Dr. Sarah Smith', date: 'Oct 20, 2024' },
  { id: 'r5', name: 'Question Bank: Midterms', subject: 'General', type: 'PDF', size: '0.8 MB', faculty: 'Admin', date: 'Oct 22, 2024' },
];

export default function StudentResources() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground mt-1">Access lecture notes, lab manuals, and supplementary references.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search documents..." 
              className="pl-10 h-10 rounded-full border-slate-200 bg-white shadow-sm text-xs" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-10 px-6">
            <Layers className="h-4 w-4" /> All Repositories
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-primary/5 p-6 rounded-[2rem]">
            <div className="text-center space-y-2">
              <BookCopy className="h-10 w-10 text-primary mx-auto" />
              <p className="text-2xl font-bold text-primary">124 Items</p>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Available Materials</p>
            </div>
          </Card>

          <div className="space-y-1">
            {['Current Semester', 'Policy Documents', 'Question Banks', 'Archived Courses'].map(cat => (
              <Button key={cat} variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm group">
                <Folder className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" /> {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid gap-4">
            {RESOURCES.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(item => (
              <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group bg-white">
                <div className="h-1 w-full bg-slate-50 group-hover:bg-primary transition-colors" />
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-105",
                    item.type === 'VIDEO' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {item.type === 'VIDEO' ? <PlayCircle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-1.5 border-slate-200 text-slate-400">
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400 tracking-tight">
                      <span className="flex items-center gap-1"><Folder className="h-3 w-3" /> {item.subject}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.date}</span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-primary/5 text-primary"
                      onClick={() => toast({ title: 'Accessing Resource', description: `Initializing download for ${item.name}...` })}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 text-slate-400 hidden sm:flex">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
