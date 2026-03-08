'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, Mail, BookOpen, MessageSquare, 
  UserPlus, Edit3, MoreHorizontal, Loader2,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

const deptColors: Record<string, string> = {
  'Engineering': 'bg-blue-100 text-blue-700 border-blue-200',
  'Arts & Design': 'bg-purple-100 text-purple-700 border-purple-200',
  'Management': 'bg-amber-100 text-amber-700 border-amber-200',
  'Applied Sciences': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'General': 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function FacultyManagementPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const deptsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore]);

  const classesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'classes');
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: departments } = useCollection(deptsQuery);
  const { data: classes } = useCollection(classesQuery);

  const faculty = users?.filter(u => 
    u.role === 'faculty' && 
    (`${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Directory of academic staff and their teaching assignments.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full px-6">
          <Plus className="h-4 w-4" /> Add Faculty Member
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email or department..." 
          className="pl-10 bg-white border-none shadow-sm h-11 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {usersLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Faculty Directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty?.map((member) => {
            const dept = departments?.find(d => d.id === member.departmentId);
            const assignedClasses = classes?.filter(c => c.facultyId === member.id) || [];
            const colorClass = deptColors[dept?.name || 'General'] || deptColors['General'];

            return (
              <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <div className={cn("h-1.5 w-full", colorClass.split(' ')[0])} />
                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src={member.photoURL} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 pt-1">
                    <CardTitle className="text-lg font-headline font-bold text-slate-800">
                      Dr. {member.firstName} {member.lastName}
                    </CardTitle>
                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-tight", colorClass)}>
                      {dept?.name || 'Academic Faculty'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-1 -mr-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Edit3 className="h-4 w-4" /> Edit Profile</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-600"><Plus className="h-4 w-4" /> Revoke Access</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                      <BookOpen className="h-3.5 w-3.5" /> Assigned Classes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedClasses.length > 0 ? assignedClasses.map(c => (
                        <Badge key={c.id} variant="secondary" className="bg-slate-50 text-[10px] py-0 px-2 font-medium">
                          {c.name}
                        </Badge>
                      )) : (
                        <span className="text-xs text-muted-foreground italic">No classes assigned</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 hover:bg-primary/5 hover:text-primary">
                    <Briefcase className="h-3.5 w-3.5" /> Assign Class
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 hover:bg-emerald-50 hover:text-emerald-600">
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          {!usersLoading && faculty?.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[2rem] bg-slate-50/50">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-slate-200" />
              <p className="font-bold text-slate-800">No faculty members found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Invite teachers to the portal to start managing academic records.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
