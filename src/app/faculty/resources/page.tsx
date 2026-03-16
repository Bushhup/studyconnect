'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Plus, Search, Folder, 
  Trash2, Clock, ShieldCheck, Globe,
  Upload, MoreVertical, ExternalLink,
  BookCopy, Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MOCK_MATERIALS = [
  { id: 'm1', name: 'ML Unit 1 - Supervised Learning', category: 'Lecture Notes', size: '2.4 MB', status: 'Published', date: '2024-10-01' },
  { id: 'm2', name: 'Assignment 2 - Neural Networks', category: 'Assignments', size: '0.8 MB', status: 'Draft', date: '2024-10-12' },
  { id: 'm3', name: 'Reference Text: Pattern Recognition', category: 'E-Books', size: '12.1 MB', status: 'Published', date: '2024-09-20' },
];

export default function FacultyResources() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const handleUpload = () => {
    toast({
      title: 'Material Uploaded',
      description: 'The new resource is currently in draft state.',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground mt-1">Upload lecture notes, reference papers, and student assignments.</p>
        </div>
        <Button onClick={handleUpload} className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-8">
          <Upload className="h-4 w-4" /> Upload Material
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
           <Card className="border-none shadow-sm bg-primary/5 p-6 rounded-[2rem]">
              <div className="text-center space-y-2">
                 <BookCopy className="h-8 w-8 text-primary mx-auto" />
                 <p className="text-xl font-bold">18 Materials</p>
                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Repository</p>
              </div>
           </Card>

           <div className="space-y-1">
             {['All Materials', 'Lecture Notes', 'Assignments', 'Question Banks', 'Syllabus'].map(cat => (
               <Button key={cat} variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm">
                 <Folder className="h-4 w-4 text-slate-400" /> {cat}
               </Button>
             ))}
           </div>
        </div>

        <div className="md:col-span-3 space-y-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search repository..." 
                className="pl-12 bg-white border-none shadow-sm h-12 rounded-[1.2rem]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <div className="grid gap-4">
              {MOCK_MATERIALS.map(item => (
                <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[1.5rem] overflow-hidden group">
                  <div className="h-1 w-full bg-slate-50 group-hover:bg-primary transition-colors" />
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <Badge variant="secondary" className={cn(
                          "text-[9px] font-bold uppercase",
                          item.status === 'Published' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400 tracking-tight">
                        <span className="flex items-center gap-1"><Folder className="h-3 w-3" /> {item.category}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.date}</span>
                        <span>{item.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 text-primary">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 text-red-400">
                        <Trash2 className="h-4 w-4" />
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
