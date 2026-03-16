'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, ChevronLeft, 
  ChevronRight, Clock, MapPin, Tag,
  Layers, Users, Briefcase, GraduationCap,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const EVENTS = [
  { id: '1', title: 'ML Practical Session', time: '09:00 AM', room: 'Lab 302', category: 'Class', color: 'bg-blue-500' },
  { id: '2', title: 'Assignment Due: AI402', time: '11:59 PM', room: 'Portal', category: 'Deadline', color: 'bg-red-500' },
  { id: '3', title: 'Tech Society Meet', time: '04:00 PM', room: 'Auditorium', category: 'Cultural', color: 'bg-emerald-500' },
];

export default function StudentCalendar() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Academic Timeline</h1>
          <p className="text-muted-foreground mt-1">Schedules, deadlines, and important institutional events.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 gap-2 h-11 px-6">
          <Plus className="h-4 w-4" /> Add Personal Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl font-headline font-bold">October 2024</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-tight">Month</Button>
                <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-tight">Week</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 bg-slate-50/30 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-3 text-center text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 grid-rows-5 h-[600px]">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 6; 
                  const isCurrentMonth = day > 0 && day <= 31;
                  const isToday = day === 24;

                  return (
                    <div key={i} className={cn(
                      "p-2 border-r border-b relative hover:bg-slate-50 transition-colors",
                      !isCurrentMonth && "bg-slate-50/50",
                      isToday && "bg-primary/5"
                    )}>
                      <span className={cn(
                        "text-[10px] font-bold",
                        !isCurrentMonth ? "text-slate-300" : "text-slate-500",
                        isToday && "text-primary bg-white shadow-sm px-1.5 py-0.5 rounded-md"
                      )}>
                        {day > 31 ? day - 31 : day <= 0 ? 30 + day : day}
                      </span>
                      
                      {day === 24 && (
                        <div className="mt-2 space-y-1">
                          {EVENTS.map(e => (
                            <div key={e.id} className={cn("text-[8px] font-bold text-white px-1.5 py-0.5 rounded-sm truncate", e.color)}>
                              {e.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Today's Agenda</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {EVENTS.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[8px] font-bold uppercase border-none bg-white py-0 px-1.5 shadow-sm">
                      {item.category}
                    </Badge>
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.title}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium mt-0.5">
                      <MapPin className="h-3 w-3" /> {item.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Legend</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-600">Classes</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-600">Exams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
