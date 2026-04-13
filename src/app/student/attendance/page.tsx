'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, Clock, CheckCircle2, XCircle, 
  TrendingUp, AlertCircle, Filter, Search,
  ArrowUpRight, BarChart3, Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  XAxis, YAxis, CartesianGrid, 
  AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ATTENDANCE_DATA = [
  { subject: 'Machine Learning', total: 42, attended: 40, percent: 95 },
  { subject: 'Advanced Algorithms', total: 38, attended: 35, percent: 92 },
  { subject: 'Applied Physics', total: 24, attended: 20, percent: 83 },
  { subject: 'Discrete Math', total: 40, attended: 38, percent: 95 },
  { subject: 'Design Thinking', total: 18, attended: 12, percent: 66 },
];

const weeklyTrend = [
  { label: 'Mon', value: 100 },
  { label: 'Tue', value: 80 },
  { label: 'Wed', value: 100 },
  { label: 'Thu', value: 100 },
  { label: 'Fri', value: 0 },
];

export default function StudentAttendance() {
  const { toast } = useToast();
  const overallAvg = Math.round(ATTENDANCE_DATA.reduce((acc, curr) => acc + curr.percent, 0) / ATTENDANCE_DATA.length);

  const handleDownload = () => {
    toast({
      title: 'Preparing Download',
      description: 'Your complete semester attendance history is being exported to a PDF document.'
    });
  };

  const handleRemind = () => {
    toast({
      title: 'Alert Configured',
      description: 'You will receive a notification 15 minutes before your next class begins.'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Presence Overview</h1>
          <p className="text-muted-foreground mt-1">Track your session-wise attendance and institutional compliance.</p>
        </div>
        <Button onClick={handleDownload} variant="outline" className="rounded-full gap-2 border-slate-200 shadow-sm bg-white">
          <Layers className="h-4 w-4" /> Download History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-50/50 rounded-[2rem] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <CardDescription className="text-blue-700 font-bold uppercase text-[10px] tracking-widest">Average Rate</CardDescription>
            <div className="p-2 bg-blue-100 rounded-xl">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-blue-900">{overallAvg}%</p>
            <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tight mt-1">+2.4% vs Last Month</p>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50/50 rounded-[2rem] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <CardDescription className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Classes Attended</CardDescription>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-emerald-900">145 / 162</p>
            <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-tight mt-1">Sessions Completed</p>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden relative">
          <Clock className="absolute right-[-10px] bottom-[-10px] h-20 w-20 text-slate-50 -rotate-12" />
          <div className="flex items-center justify-between relative z-10">
            <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Weekly Trend</CardDescription>
          </div>
          <div className="h-16 mt-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg font-headline">Subject-wise Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {ATTENDANCE_DATA.map((item) => (
                  <div key={item.subject} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-800">{item.subject}</p>
                        {item.percent < 75 && (
                          <Badge className="bg-red-50 text-red-600 border-none text-[8px] px-1.5 uppercase font-bold">Low Attendance</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-full max-w-[200px]">
                          <Progress value={item.percent} className={cn(
                            "h-1.5",
                            item.percent < 75 ? "bg-red-100" : "bg-slate-100"
                          )} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          item.percent < 75 ? "text-red-600" : "text-slate-600"
                        )}>{item.percent}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{item.attended} / {item.total}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-amber-50 text-amber-900 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <p className="font-headline font-bold">Institutional Warning</p>
            </div>
            <p className="text-xs leading-relaxed text-amber-800/80">
              Your attendance in <strong>Design Thinking</strong> is currently <strong>66%</strong>, which is below the mandatory 75% threshold. Please ensure presence in upcoming sessions to avoid condonation issues.
            </p>
            <Button onClick={() => toast({ title: 'Policy Hub', description: 'Institutional handbook loaded. Section 4.2 covers attendance mandates.' })} variant="link" className="text-amber-700 font-bold p-0 h-auto text-xs uppercase tracking-tight">View Policy Details →</Button>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/60">Next Scheduled Class</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl">09</div>
                <div>
                  <p className="text-sm font-bold">Machine Learning</p>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Room 302 • Mon, Oct 28</p>
                </div>
              </div>
              <Button onClick={handleRemind} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-11">
                Remind Me
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}