'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, GraduationCap, Building2, BookOpen, 
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  Calendar, Award, ArrowUpRight, ArrowDownRight,
  MoreVertical, Search, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Total Students', value: '4,850', icon: GraduationCap, trend: '+12.5%', trendUp: true, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600' },
  { label: 'Total Faculty', value: '320', icon: Users, trend: '+3.2%', trendUp: true, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-600' },
  { label: 'Departments', value: '18', icon: Building2, trend: 'Stable', trendUp: null, color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-600' },
  { label: 'Attendance Rate', value: '94.2%', icon: CheckCircle2, trend: '-0.4%', trendUp: false, color: 'from-amber-500 to-amber-600', textColor: 'text-amber-600' },
];

const performanceData = [
  { month: 'Jan', attendance: 92, performance: 78 },
  { month: 'Feb', attendance: 88, performance: 82 },
  { month: 'Mar', attendance: 95, performance: 85 },
  { month: 'Apr', attendance: 91, performance: 80 },
  { month: 'May', attendance: 94, performance: 88 },
  { month: 'Jun', attendance: 96, performance: 90 },
];

const deptDistribution = [
  { name: 'Engineering', value: 40, color: '#3B82F6' },
  { name: 'Arts', value: 25, color: '#8B5CF6' },
  { name: 'Science', value: 20, color: '#10B981' },
  { name: 'Business', value: 15, color: '#F59E0B' },
];

const recentActivities = [
  { id: 1, user: 'Dr. Sarah Smith', action: 'Uploaded new course materials', time: '10 mins ago', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, user: 'Admin System', action: 'Generated monthly attendance report', time: '1 hour ago', avatar: '' },
  { id: 3, user: 'Prof. James Wilson', action: 'Updated grades for Computer Science 101', time: '3 hours ago', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 4, user: 'System', action: 'Scheduled maintenance update', time: '5 hours ago', avatar: '' },
];

const chartConfig = {
  attendance: { label: 'Attendance %', color: 'hsl(var(--primary))' },
  performance: { label: 'Performance Avg', color: 'hsl(var(--secondary))' },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1">Detailed performance and demographic analytics for the current semester.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white shadow-sm font-medium">Download Report</Button>
          <Button className="font-medium shadow-md shadow-primary/20">Generate Insights</Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-xl bg-opacity-10", stat.textColor.replace('text-', 'bg-'))}>
                <stat.icon className={cn("h-4 w-4", stat.textColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="flex items-center mt-2 gap-1.5">
                {stat.trendUp !== null ? (
                  <div className={cn(
                    "flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {stat.trend}
                  </div>
                ) : (
                  <div className="px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-600 text-[10px] font-bold">Stable</div>
                )}
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">vs last month</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000 bg-gradient-to-r", stat.color)} style={{ width: stat.trendUp ? '75%' : '45%' }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Performance Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline font-bold">Performance & Attendance</CardTitle>
              <CardDescription>Monthly growth trends across all departments.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">Attendance</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100">Grades</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-attendance)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-attendance)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-performance)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-performance)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="var(--color-attendance)" 
                  strokeWidth={3}
                  fill="url(#colorAttendance)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="var(--color-performance)" 
                  strokeWidth={3}
                  fill="url(#colorPerformance)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Enrollment Share</CardTitle>
            <CardDescription>Department-wise student distribution.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {deptDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
               {deptDistribution.map((item) => (
                 <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-muted-foreground truncate">{item.name}</span>
                    <span className="text-xs font-bold ml-auto">{item.value}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-headline font-bold">Timeline Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary font-bold">View History</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative">
                  <div className="flex-shrink-0 z-10">
                    <Avatar className="h-10 w-10 border-4 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback className="bg-slate-50 text-slate-400 font-bold">
                        {activity.user === 'System' ? 'S' : activity.user[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow pt-0.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-bold text-slate-800">{activity.user}</h4>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{activity.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{activity.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Task Widget */}
        <Card className="border-none shadow-sm gradient-blue-purple text-white">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Pending Reviews</CardTitle>
            <CardDescription className="text-white/70">Immediate actions required today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Grade Approvals', count: 12, icon: Award },
              { label: 'New Faculty Requests', count: 4, icon: Users },
              { label: 'System Reports', count: 2, icon: FileText },
            ].map((task) => (
              <div key={task.label} className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <task.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{task.label}</span>
                </div>
                <Badge variant="secondary" className="bg-white text-primary font-bold">{task.count}</Badge>
              </div>
            ))}
            <Button className="w-full mt-2 bg-white text-primary hover:bg-white/90 font-bold py-6">
              Go to Action Center
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}