
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Plus, Users, Globe, UserCog, History, MoreVertical } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NotificationsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Announcements</h1>
          <p className="text-muted-foreground mt-1">Broadcast messages to the entire college or specific segments.</p>
        </div>
        <Button variant="outline" className="gap-2 shadow-sm"><History className="h-4 w-4" /> Message History</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
           <CardHeader>
              <CardTitle>Compose Broadcast</CardTitle>
              <CardDescription>Send an immediate alert or schedule an announcement.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Announcement Title</Label>
                 <Input placeholder="e.g. Campus Holiday Notice" className="bg-slate-50 border-none" />
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Audience</Label>
                 <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" className="gap-2 rounded-full h-8 bg-blue-50 text-blue-600 hover:bg-blue-100">
                       <Globe className="h-3.5 w-3.5" /> Everyone
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 rounded-full h-8">
                       <Users className="h-3.5 w-3.5" /> Students Only
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 rounded-full h-8">
                       <UserCog className="h-3.5 w-3.5" /> Faculty Only
                    </Button>
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Content</Label>
                 <Textarea placeholder="Write your announcement details here..." className="min-h-[150px] bg-slate-50 border-none resize-none" />
              </div>
              <div className="pt-2">
                 <Button className="w-full gap-2 shadow-lg shadow-primary/20 py-6 text-lg font-bold uppercase tracking-tight">
                    <Send className="h-5 w-5" /> Dispatch Announcement
                 </Button>
              </div>
           </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                 <CardTitle className="text-sm flex items-center justify-between">
                    Live Status
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-bold text-emerald-500 uppercase">Operational</span>
                    </div>
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-3 rounded-lg bg-slate-50 border flex justify-between items-center">
                    <span className="text-xs font-medium">Email Delivery</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px]">99% Success</Badge>
                 </div>
                 <div className="p-3 rounded-lg bg-slate-50 border flex justify-between items-center">
                    <span className="text-xs font-medium">Push Notifications</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px]">Stable</Badge>
                 </div>
              </CardContent>
           </Card>

           <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Recent Activity</h4>
              {[
                { title: 'Fee Deadline Reminder', time: '2 hours ago', status: 'delivered' },
                { title: 'Exam Schedule Update', time: '5 hours ago', status: 'delivered' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white rounded-xl shadow-sm flex items-start gap-3">
                   <div className="p-2 rounded-lg bg-slate-50">
                      <Bell className="h-4 w-4 text-slate-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                   </div>
                   <MoreVertical className="h-4 w-4 text-slate-300" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
