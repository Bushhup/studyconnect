'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Search, MoreHorizontal, Plus, GraduationCap, ShieldCheck, UserCog, Edit3, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATIC_USERS = [
  { id: '1', email: 'admin@college.edu', firstName: 'System', lastName: 'Admin', role: 'admin', status: 'active' },
  { id: '2', email: 'sarah.smith@college.edu', firstName: 'Sarah', lastName: 'Smith', role: 'faculty', status: 'active' },
  { id: '3', email: 'alex.j@college.edu', firstName: 'Alex', lastName: 'Johnson', role: 'student', status: 'active' },
  { id: '4', email: 'michael.c@college.edu', firstName: 'Michael', lastName: 'Chen', role: 'student', status: 'active' },
  { id: '5', email: 'james.w@college.edu', firstName: 'James', lastName: 'Wilson', role: 'faculty', status: 'active' },
];

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredUsers = STATIC_USERS.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const emailStr = u.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || emailStr.includes(query);
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Directory</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access control (Static Prototype).</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
          <Plus className="h-4 w-4" /> Register New User
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-white border shadow-sm h-11 p-1 rounded-xl">
            <TabsTrigger value="all" className="gap-2 px-4 rounded-lg"><Users className="h-4 w-4" /> All</TabsTrigger>
            <TabsTrigger value="student" className="gap-2 px-4 rounded-lg"><GraduationCap className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 px-4 rounded-lg"><UserCog className="h-4 w-4" /> Faculty</TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 px-4 rounded-lg"><ShieldCheck className="h-4 w-4" /> Admins</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 bg-white border-none shadow-sm h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[300px] font-bold text-slate-900 py-4 pl-6">User Details</TableHead>
                  <TableHead className="font-bold text-slate-900">Portal Role</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-900 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="group transition-colors hover:bg-slate-50/50 border-slate-100">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 leading-tight">{u.firstName} {u.lastName}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 border-none",
                          u.role === 'admin' ? "bg-blue-50 text-blue-600" :
                          u.role === 'faculty' ? "bg-purple-50 text-purple-600" :
                          "bg-emerald-50 text-emerald-600"
                        )}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'inactive' ? 'bg-slate-300' : 'bg-emerald-500')} />
                          <span className="text-xs font-semibold text-slate-600 capitalize">{u.status}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full h-8 w-8 transition-all">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Eye className="h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Edit3 className="h-4 w-4" /> Edit Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
