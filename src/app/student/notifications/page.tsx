'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, Filter, MoreVertical, 
  Briefcase, GraduationCap, Building2,
  Check, FileSpreadsheet, Megaphone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NOTIFICATIONS = [
  { id: '1', type: 'deadline', title: 'Upcoming Assignment Deadline', content: 'Neural Networks Implementation is due in 48 hours. Ensure your submission is uploaded to the portal.', time: '10 mins ago', isRead: false, category: 'Academic' },
  { id: '2', type: 'marks', title: 'Marks Published: CAT-2', content: 'Internal marks for Applied Physics (Sem 5) have been released. View your scores in the marks portal.', time: '1 hour ago', isRead: false, category: 'Grades' },
  { id: '3', type: 'attendance', title: 'Low Attendance Alert', content: 'Your presence in Design Thinking has fallen below 75%. Please meet your faculty advisor.', time: '3 hours ago', isRead: true, category: 'System' },
  { id: '4', type: 'broadcast', title: 'New Campus Announcement', content: 'The registration for the Annual Tech Symposium is now open for all UG students.', time: 'Yesterday', isRead: true, category: 'General' },
];

export default function StudentNotifications() {
  const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Real-time alerts regarding deadlines, grades, and campus updates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2 border-slate-200 bg-white">
            <Check className="h-4 w-4" /> Mark All as Read
          </Button>
          <Button variant="ghost" className="rounded-full gap-2 h-11 px-6 text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Clear History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-primary/5 rounded-[2rem] p-8">
            <div className="text-center space-y-3">
              <div className="relative inline-block">
                <div className="p-4 bg-white rounded-3xl shadow-lg border-2 border-primary/10">
                  <Bell className="h-10 w-10 text-primary" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{unreadCount} Unread</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Alerts</p>
              </div>
            </div>
          </Card>

          <div className="space-y-1">
            {[
              { label: 'All Activity', icon: Bell },
              { label: 'Deadlines', icon: Briefcase },
              { label: 'Grade Updates', icon: FileSpreadsheet },
              { label: 'Broadcasts', icon: Megaphone },
            ].map(item => (
              <Button key={item.label} variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm group">
                <item.icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" /> {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {NOTIFICATIONS.map((item) => (
            <Card key={item.id} className={cn(
              "border-none shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md",
              !item.isRead ? "bg-white border-l-4 border-l-primary" : "bg-slate-50/50"
            )}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-2xl flex-shrink-0 transition-transform",
                  item.type === 'deadline' ? "bg-red-50 text-red-600" :
                  item.type === 'marks' ? "bg-blue-50 text-blue-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {item.type === 'deadline' ? <Briefcase className="h-5 w-5" /> :
                   item.type === 'marks' ? <FileSpreadsheet className="h-5 w-5" /> :
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
                    <div className="mt-3 flex gap-4">
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary uppercase tracking-tight">Mark as read</Button>
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-slate-400 uppercase tracking-tight">Dismiss</Button>
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
