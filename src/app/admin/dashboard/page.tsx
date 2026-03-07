
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, GraduationCap, Building2, BookOpen, 
  TrendingUp, TrendingDown, Clock, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const stats = [
  { label: 'Total Students', value: '4,850', icon: GraduationCap, trend: '+12%', trendUp: true },
  { label: 'Total Faculty', value: '320', icon: Users, trend: '+3%', trendUp: true },
  { label: 'Departments', value: '18', icon: Building2, trend: 'Stable', trendUp: null },
  { label: 'Active Classes', value: '142', icon: BookOpen, trend: '+5', trendUp: true },
];

const performanceData = [
  { month: 'Jan', attendance: 92, performance: 78 },
  { month: 'Feb', attendance: 88, performance: 82 },
  { month: 'Mar', attendance: 95, performance: 85 },
  { month: 'Apr', attendance: 91, performance: 80 },
  { month: 'May', attendance: 94, performance: 88 },
  { month: 'Jun', attendance: 96, performance: 90 },
];

const recentActivities = [
  { id: 1, text: 'New faculty member registered: Dr. Sarah Smith', time: '10 mins ago', type: 'user' },
  { id: 2, text: 'Attendance report generated for CSE Dept', time: '1 hour ago', type: 'report' },
  { id: 3, text: 'Maintenance update scheduled for portal', time: '3 hours ago', type: 'system' },
  { id: 4, text: 'New course "Advanced AI" added by Admin', time: '5 hours ago', type: 'course' },
];

const chartConfig = {
  attendance: { label: 'Attendance %', color: 'hsl(var(--primary))' },
  performance: { label: 'Performance Avg', color: 'hsl(var(--accent))' },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System-wide overview and performance statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn(
                "text-xs mt-1",
                stat.trendUp === true ? "text-green-600" : stat.trendUp === false ? "text-red-600" : "text-muted-foreground"
              )}>
                {stat.trendUp !== null && (stat.trendUp ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />)}
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Attendance & Performance Trends</CardTitle>
            <CardDescription>Monthly average across all departments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="var(--color-attendance)" 
                  fill="var(--color-attendance)" 
                  fillOpacity={0.2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="var(--color-performance)" 
                  fill="var(--color-performance)" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system-wide events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
