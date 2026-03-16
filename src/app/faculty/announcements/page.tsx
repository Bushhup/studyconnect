'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Megaphone, Plus, Send, Clock, 
  Trash2, Edit3, Globe, Users, 
  BookOpen, Filter, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: 'Final Exam Schedule Published', content: 'The comprehensive schedule for Semester 5 Final Examinations is now available in the resources section.', target: 'All Students', date: '2 hours ago', subject: 'General' },
  { id: '2', title: 'Lab 302 Maintenance', content: 'Machine Learning practical sessions for Tuesday will be relocated to Computer Lab 1.', target: 'ML Section A', date: 'Yesterday', subject: 'Machine Learning' },
];

export default function FacultyAnnouncements() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    toast({ title: 'Announcement Published', description: 'Your message has been broadcasted to selected classes.' });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Broadcasts</h1>
          <p className="text-muted-foreground mt-1">Communicate critical information directly to your students' portals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Compose Announcement</CardTitle>
            <CardDescription>Send immediate alerts or schedule future updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDispatch} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Broadcast Title</Label>
                <Input 
                  placeholder="e.g. Rescheduled Lab Session" 
                  className="bg-slate-50 border-none h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Target Audience</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Enrolled Students</SelectItem>
                      <SelectItem value="ml-a">ML - Section A</SelectItem>
                      <SelectItem value="ds-b">DS - Section B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Subject (Optional)</Label>
                  <Select defaultValue="general">
                    <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Update</SelectItem>
                      <SelectItem value="ml">Machine Learning</SelectItem>
                      <SelectItem value="ds">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Message Content</Label>
                <Textarea 
                  placeholder="Detail your announcement here..." 
                  className="bg-slate-50 border-none min-h-[150px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold uppercase tracking-tight shadow-lg shadow-primary/20">
                <Send className="mr-2 h-5 w-5" /> Dispatch Announcement
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 bg-white/10 rounded-xl">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">Live Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Broadcasting Active</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Recent Activity</h4>
            {MOCK_ANNOUNCEMENTS.map((item) => (
              <Card key={item.id} className="border-none shadow-sm bg-white rounded-2xl hover:shadow-md transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-100 px-1.5">
                      {item.subject}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.date}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{item.content}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary">
                      <Users className="h-3 w-3" /> {item.target}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-slate-50">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-red-50 text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

function Select({ children, defaultValue, ...props }: any) {
  return (
    <div className="relative">
      <select {...props} className="w-full bg-slate-50 border-none h-11 px-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none">
        {children}
      </select>
    </div>
  );
}