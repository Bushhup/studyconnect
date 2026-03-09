'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Mail, BookOpen, MessageSquare, Edit3, MoreHorizontal, Briefcase, CheckCircle2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DEPARTMENTS = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Arts & Design' },
  { id: 'dept-3', name: 'Management' },
  { id: 'dept-4', name: 'Applied Sciences' },
];

const STATIC_FACULTY = [
  { id: 'f-1', firstName: 'Sarah', lastName: 'Smith', email: 'sarah.s@college.edu', departmentId: 'dept-1', classes: ['CS-101', 'AI-402'] },
  { id: 'f-2', firstName: 'James', lastName: 'Wilson', email: 'james.w@college.edu', departmentId: 'dept-2', classes: ['UX-201'] },
  { id: 'f-3', firstName: 'Emily', lastName: 'Davis', email: 'emily.d@college.edu', departmentId: 'dept-3', classes: ['ECON-105'] },
];

const deptColors: Record<string, string> = {
  'Engineering': 'bg-blue-100 text-blue-700',
  'Arts & Design': 'bg-purple-100 text-purple-700',
  'Management': 'bg-amber-100 text-amber-700',
  'Applied Sciences': 'bg-emerald-100 text-emerald-700',
  'General': 'bg-slate-100 text-slate-700'
};

export default function FacultyManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

  const filteredFaculty = STATIC_FACULTY.filter(f => 
    `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-muted-foreground mt-1">Directory of academic staff and assignments (Static Prototype).</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
          <Plus className="h-4 w-4" /> Add Faculty Member
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          className="pl-10 bg-white border-none shadow-sm h-11 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((member) => {
          const dept = DEPARTMENTS.find(d => d.id === member.departmentId);
          const colorClass = deptColors[dept?.name || 'General'];

          return (
            <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-[2rem]">
              <div className={cn("h-1.5 w-full", colorClass.split(' ')[0])} />
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <Avatar className="h-16 w-16 border-4 border-white shadow-sm ring-1 ring-slate-100">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                    {member.firstName[0]}{member.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 pt-1">
                  <CardTitle className="text-lg font-headline font-bold text-slate-800">
                    Dr. {member.firstName} {member.lastName}
                  </CardTitle>
                  <Badge variant="outline" className={cn("text-[10px] font-bold uppercase border-none", colorClass)}>
                    {dept?.name || 'Academic Faculty'}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="gap-2" onClick={() => {setSelectedFaculty(member); setIsEditOpen(true);}}>
                      <Edit3 className="h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" /> Assigned Classes
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.classes.map(c => (
                      <Badge key={c} variant="secondary" className="bg-slate-50 text-[10px] py-0 px-2 font-medium">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 rounded-lg">
                  <Briefcase className="h-3.5 w-3.5" /> Assign
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 text-emerald-600 rounded-lg hover:bg-emerald-50">
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Edit Faculty Profile</DialogTitle>
            <DialogDescription>Update record for Dr. {selectedFaculty?.firstName} (Prototype Only).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                <Input defaultValue={selectedFaculty?.firstName} className="bg-slate-50 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                <Input defaultValue={selectedFaculty?.lastName} className="bg-slate-50 border-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Department</Label>
              <Select defaultValue={selectedFaculty?.departmentId}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full h-12 font-bold shadow-lg shadow-primary/20" onClick={() => {toast({ title: 'Record Updated', description: 'Faculty profile saved in local memory.' }); setIsEditOpen(false);}}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
