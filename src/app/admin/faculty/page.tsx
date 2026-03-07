
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, doc } from '@/firebase';
import { collection } from 'firebase/firestore';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, BookOpen, Users, MoreHorizontal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

export default function FacultyManagementPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const faculty = users?.filter(u => 
    u.role === 'faculty' && 
    (`${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-muted-foreground mt-1">Manage academic staff, research leads, and department heads.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Faculty Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-l-4 border-indigo-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-indigo-700 font-bold uppercase text-[10px] tracking-widest">Total Faculty</CardDescription>
            <CardTitle className="text-2xl">{faculty?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-700 font-bold uppercase text-[10px] tracking-widest">Research Leads</CardDescription>
            <CardTitle className="text-2xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-l-4 border-teal-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-teal-700 font-bold uppercase text-[10px] tracking-widest">Available for Mentoring</CardDescription>
            <CardTitle className="text-2xl">85%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="border-b pb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search faculty..." 
              className="pl-10 bg-slate-50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold py-4 pl-6">Faculty Member</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold">Expertise</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : faculty?.map((member) => (
                <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src={member.photoURL} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-tight">
                          Dr. {member.firstName} {member.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase">
                          Senior Professor
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[9px] px-2 py-0">Algorithms</Badge>
                      <Badge variant="outline" className="text-[9px] px-2 py-0">AI/ML</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-600">Active</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2"><BookOpen className="h-4 w-4" /> Assign Course</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><Users className="h-4 w-4" /> View Classes</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
