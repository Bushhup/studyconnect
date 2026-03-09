'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, Plus, Mail, BookOpen, MessageSquare, 
  UserPlus, Edit3, MoreHorizontal, Loader2,
  Briefcase, CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

  // Form States
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openEdit = (member: any) => {
    setSelectedFaculty(member);
    setEditFirstName(member.firstName || '');
    setEditLastName(member.lastName || '');
    setEditDeptId(member.departmentId || '');
    setIsEditOpen(true);
  };

  const openAssign = (member: any) => {
    setSelectedFaculty(member);
    setAssignClassId('');
    setIsAssignOpen(true);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !editFirstName) return;

    setIsSubmitting(true);
    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedFaculty.id);
    
    updateDocumentNonBlocking(userRef, {
      firstName: editFirstName,
      lastName: editLastName,
      departmentId: editDeptId,
    });

    toast({ title: 'Profile Updated', description: 'Faculty records have been synchronized.' });
    setIsSubmitting(false);
    setIsEditOpen(false);
  };

  const handleAssignClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !assignClassId) return;

    setIsSubmitting(true);
    const classRef = doc(firestore, 'colleges', collegeId, 'classes', assignClassId);
    
    updateDocumentNonBlocking(classRef, {
      facultyId: selectedFaculty.id
    });

    const className = classes?.find(c => c.id === assignClassId)?.name || 'the class';
    toast({ 
      title: 'Class Assigned', 
      description: `${className} is now handled by Dr. ${selectedFaculty.firstName}.` 
    });
    
    setIsSubmitting(false);
    setIsAssignOpen(false);
  };

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
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-1 -mr-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(member)}>
                        <Edit3 className="h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-600 cursor-pointer">
                        <Plus className="h-4 w-4 rotate-45" /> Revoke Access
                      </DropdownMenuItem>
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold gap-2 hover:bg-primary/5 hover:text-primary"
                    onClick={() => openAssign(member)}
                  >
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty Profile</DialogTitle>
            <DialogDescription>Update institutional metadata for this faculty member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} required className="bg-slate-50 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} required className="bg-slate-50 border-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department</Label>
              <Select onValueChange={setEditDeptId} value={editDeptId}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full font-bold h-11" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Class Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Academic Class</DialogTitle>
            <DialogDescription>Link an existing class section to Dr. {selectedFaculty?.firstName}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignClass} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Class Section</Label>
              <Select onValueChange={setAssignClassId} value={assignClassId}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Choose a section to assign" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.filter(c => c.facultyId !== selectedFaculty?.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.facultyId ? `(Reassign from current instructor)` : ''}
                    </SelectItem>
                  ))}
                  {classes?.length === 0 && (
                    <SelectItem value="none" disabled>No classes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full font-bold h-11" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Briefcase className="mr-2 h-4 w-4" />}
              Confirm Assignment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}