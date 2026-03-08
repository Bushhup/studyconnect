'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Users, Clock, MapPin, Loader2, 
  Calendar, BookOpen, UserCheck, X 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const collegeId = 'study-connect-college';

export default function ClassManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newClassName, setNewClassName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // Fetch Classes
  const classesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'classes');
  }, [firestore]);

  // Fetch Departments for mapping
  const deptsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore]);

  // Fetch Users (Faculty) for mapping
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: classes, isLoading: classesLoading } = useCollection(classesQuery);
  const { data: departments } = useCollection(deptsQuery);
  const { data: users } = useCollection(usersQuery);

  const facultyMembers = users?.filter(u => u.role === 'faculty') || [];

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !selectedDept) return;

    setIsSubmitting(true);
    const classesRef = collection(firestore, 'colleges', collegeId, 'classes');

    addDocumentNonBlocking(classesRef, {
      id: crypto.randomUUID(),
      name: newClassName,
      departmentId: selectedDept,
      facultyId: selectedFaculty,
      createdAt: new Date().toISOString(),
    });

    toast({ 
      title: 'Class Provisioned', 
      description: `${newClassName} has been added to the active schedule.` 
    });

    setIsSubmitting(false);
    setIsAddOpen(false);
    setNewClassName('');
    setSelectedDept('');
    setSelectedFaculty('');
  };

  const isLoading = classesLoading;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Sections & Classes</h1>
          <p className="text-muted-foreground mt-1">Manage class schedules, instructor assignments, and room allocations.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Create New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provision New Academic Section</DialogTitle>
              <DialogDescription>
                Define a new class group and assign a primary instructor.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class / Section Name</Label>
                <Input 
                  placeholder="e.g. Computer Science - Section B" 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="bg-slate-50 border-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Department</Label>
                <Select onValueChange={setSelectedDept} value={selectedDept}>
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue placeholder="Select Academic Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned Instructor (Optional)</Label>
                <Select onValueChange={setSelectedFaculty} value={selectedFaculty}>
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue placeholder="Assign a Faculty Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        Dr. {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight mt-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                Confirm Class Creation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing academic schedules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes?.map((item) => {
            const dept = departments?.find(d => d.id === item.departmentId);
            const instructor = users?.find(u => u.id === item.facultyId);
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-all border-none shadow-sm group overflow-hidden bg-white">
                <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-bold uppercase tracking-widest">
                      {dept?.name || 'General Academic'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-slate-300 hover:text-primary">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl font-headline mt-2">{item.name}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <BookOpen className="h-3 w-3" />
                    <span>Subject Area: {dept?.name || 'Not Specified'}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="p-1.5 bg-blue-50 rounded-lg">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <span className="font-semibold text-xs">45 Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="p-1.5 bg-emerald-50 rounded-lg">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-xs">Lab 302</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium">Mon, Wed • 09:00 AM - 11:00 AM</span>
                  </div>

                  <div className="pt-4 border-t border-dashed">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <UserCheck className="h-3 w-3" /> Handling Instructor
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src={instructor?.photoURL} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {instructor?.firstName?.[0] || 'F'}{instructor?.lastName?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">
                          {instructor ? `Dr. ${instructor.firstName} ${instructor.lastName}` : 'TBD'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          Department Lead
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2 font-bold text-xs h-10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    View Full Roster
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          
          {classes?.length === 0 && !isLoading && (
            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[2rem] bg-slate-50/50">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-200" />
              <p className="font-bold text-slate-800">No classes scheduled yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Begin by creating a new section and assigning it to a faculty member.
              </p>
              <Button variant="link" className="mt-4 font-bold text-primary" onClick={() => setIsAddOpen(true)}>
                Add your first section
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}