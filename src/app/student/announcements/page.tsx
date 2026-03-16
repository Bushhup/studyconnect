'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, Clock, Calendar, Info, 
  MessageSquare, UserCircle, Search, Filter,
  Bell, Building2, ChevronRight, Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ANNOUNCEMENTS = [
  { id: '1', title: 'Final Exam Schedule Published', content: 'The comprehensive schedule for Semester 5 Final Examinations is now available in the results portal. Please review your designated exam centers.', author: 'Registrar Office', date: '2 hours ago', category: 'Academic', important: true },
  { id: '2', title: 'Lab 302 Maintenance', content: 'Machine Learning practical sessions for Tuesday will be relocated to Computer Lab 1 due to electrical maintenance.', author: 'Dr. Sarah Smith', date: 'Yesterday', category: 'Department', important: false },
  { id: '3', title: 'Campus Holiday Notice', content: 'The college will remain closed on Friday for the regional cultural festival.', author: 'Admin', date: '2 days ago', category: 'General', important: false },
  { id: '4', title: 'Hackathon Registration Open', content: 'Join the annual "Innovate 2024" hackathon. Teams of up to 4 can register via the Tech Society portal.', author: 'Student Council', date: '3 days ago', category: 'Cultural', important: true },
];

export default function StudentAnnouncements() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Broadcasts</h1>
          <p className="text-muted-foreground mt-1">Official updates from the administration, faculty, and student societies.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Filter alerts..." className="pl-10 h-10 rounded-full border-slate-200 bg-white shadow-sm text-xs" />
          </div>
          <Button variant="outline" className="rounded-full gap-2 border-slate-200 bg-white shadow-sm h-10 px-6">
            <Filter className="h-4 w-4" /> All Categories
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-6 relative overflow-hidden">
            <Bell className="absolute right-[-10px] top-[-10px] h-20 w-20 text-white/5 -rotate-12" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Megaphone className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Updates</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4 New Alerts</p>
                <p className="text-xs text-white/40">Since your last login</p>
              </div>
            </div>
          </Card>

          <div className="space-y-1">
            {[
              { label: 'All Updates', icon: Megaphone },
              { label: 'Academic Alerts', icon: Info },
              { label: 'Dept Notices', icon: Building2 },
              { label: 'Student Life', icon: Star },
            ].map(cat => (
              <Button key={cat.label} variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm">
                <cat.icon className="h-4 w-4 text-slate-400" /> {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {ANNOUNCEMENTS.map((item) => (
            <Card key={item.id} className={cn(
              "border-none shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md bg-white",
              item.important && "border-l-4 border-l-primary"
            )}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "text-[8px] font-bold uppercase border-none px-2",
                      item.important ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {item.category}
                    </Badge>
                    {item.important && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                    <Clock className="h-3.5 w-3.5" /> {item.date}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-headline font-bold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.content}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{item.author}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Verified Official</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary uppercase h-8 px-4 rounded-lg">
                    Full Details <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
