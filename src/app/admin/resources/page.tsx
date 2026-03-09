'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Plus, Search, Folder, HardDrive, Trash2, Link as LinkIcon, Clock, Lock, ShieldCheck, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATIC_RESOURCES = [
  { id: 'r1', name: 'Academic Handbook 2024', category: 'Policy Documents', type: 'PDF', size: '2.4 MB', access: 'Public', date: '2024-05-12' },
  { id: 'r2', name: 'Faculty Leave Policy', category: 'Policy Documents', type: 'PDF', size: '1.2 MB', access: 'Faculty', date: '2024-04-20' },
  { id: 'r3', name: 'Student Registration Form', category: 'Admin Forms', type: 'DOCX', size: '0.4 MB', access: 'Public', date: '2024-06-01' },
];

export default function ResourcesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = STATIC_RESOURCES.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground mt-1">Repository for institutional assets and policies (Static Prototype).</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 h-11 px-6 rounded-full font-bold">
          <Plus className="h-5 w-5" /> Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-[10px] text-primary font-bold uppercase tracking-widest text-center">Repository Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <HardDrive className="h-8 w-8 text-primary" />
                <p className="text-lg font-bold text-slate-800">12.4 GB / 100 GB</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary" style={{ width: '12%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1">
            {['All Documents', 'Policy Documents', 'Admin Forms', 'Faculty Assets'].map(cat => (
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
              placeholder="Search by title..." 
              className="pl-12 bg-white border-none shadow-sm h-12 rounded-[1.2rem] focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {filtered.map(res => (
              <Card key={res.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[1.5rem]">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 truncate">{res.name}</p>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200 text-slate-500">
                        {res.access}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400 tracking-tight">
                      <span className="flex items-center gap-1"><Folder className="h-3 w-3" /> {res.category}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {res.date}</span>
                      <span>{res.size}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 text-primary" onClick={() => toast({ title: 'Accessing', description: 'Prototype: File download simulated.' })}>
                      <Download className="h-4 w-4" />
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
