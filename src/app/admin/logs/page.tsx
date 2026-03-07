'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldAlert, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';

const mockLogs = [
  { id: '1', user: 'admin01@college.edu', action: 'Login Success', status: 'info', time: '2 mins ago' },
  { id: '2', user: 'system', action: 'Database Snapshot Created', status: 'success', time: '15 mins ago' },
  { id: '3', user: 'unknown', action: 'Failed Auth Attempt', status: 'warning', time: '1 hour ago' },
  { id: '4', user: 'admin01@college.edu', action: 'Modified User: student_04', status: 'info', time: '3 hours ago' },
  { id: '5', user: 'system', action: 'Maintenance Window Started', status: 'info', time: 'Yesterday' },
];

export default function LogsPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <div className="max-w-5xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
              <Activity className="text-primary" /> System Activity
            </h1>
            <p className="text-muted-foreground mt-2">Audit trail of administrative actions and security events.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Card className="max-w-5xl mx-auto shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Real-time Monitor</CardTitle>
            <CardDescription>Last 50 recorded events.</CardDescription>
          </div>
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={log.status === 'warning' ? 'destructive' : 'secondary'} className="capitalize">
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-right text-muted-foreground flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" /> {log.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
