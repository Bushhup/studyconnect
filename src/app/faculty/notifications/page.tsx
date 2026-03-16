'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, Filter, MoreVertical, 
  Briefcase, GraduationCap, Building2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'submission', title: 'New Assignment Submissions', content: '12 students have submitted "Neural Networks Implementation" for ML Section A.', time: '10 mins ago', isRead: false, category: 'Academic' },
  { id: '2', type: 'admin', title: 'Faculty Meeting Reminder', content: 'The monthly department meet is scheduled for 01:30 PM today in the Conference Hall.', time: '1 hour ago', isRead: false, category: 'Admin' },
  { id: '3', type: 'system', title: 'Portal Maintenance', content: 'The grading portal will be offline for maintenance on Sunday between 02:00 AM - 04:00 AM.', time: '3 hours ago', isRead: true, category: 'System' },
  { id: '4', type: 'submission', title: 'Late Submission Alert', content: 'Sarah Miller submitted "Graph Algorithms" 2 hours past the deadline.', time: 'Yesterday', isRead: true, category: 'Academic' },
];

export default function FacultyNotifications() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Stay updated with student activities, admin alerts, and system updates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2 border-slate-200">
            <Check className="h-4 w-4" /> Mark All as Read
          </Button>
          <Button variant="destructive" className="rounded-full gap-2 h-11 px-6 shadow-lg shadow-red-500/10">
            <Trash2 className="h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-primary/5 rounded-2xl p-6">
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <Bell className="h-10 w-10 text-primary mx-auto" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold">{unreadCount} Unread</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">New Alerts Pending</p>
            </div>
          </Card>

          <div className="space-y-1">
            {[
              { label: 'All Alerts', icon: Bell },
              { label: 'Submissions', icon: Briefcase },
              { label: 'Department', icon: Building2 },
              { label: 'System', icon: Info },
            ].map(item => (
              <Button key={item.label} variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm">
                <item.icon className="h-4 w-4 text-slate-400" /> {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {MOCK_NOTIFICATIONS.map((item) => (
            <Card key={item.id} className={cn(
              "border-none shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md",
              !item.isRead ? "bg-white border-l-4 border-l-primary" : "bg-slate-50/50"
            )}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-2xl flex-shrink-0",
                  item.type === 'submission' ? "bg-blue-50 text-blue-600" :
                  item.type === 'admin' ? "bg-purple-50 text-purple-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {item.type === 'submission' ? <Briefcase className="h-5 w-5" /> :
                   item.type === 'admin' ? <Building2 className="h-5 w-5" /> :
                   <Info className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-bold", !item.isRead ? "text-slate-900" : "text-slate-600")}>
                        {item.title}
                      </p>
                      <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-1 border-slate-200 text-slate-400">
                        {item.category}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.content}</p>
                  
                  {!item.isRead && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary uppercase">Mark as read</Button>
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-slate-400 uppercase">Dismiss</Button>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}