'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, Plus, Mail, BookOpen, 
  MessageSquare, Edit3, MoreHorizontal, 
  Briefcase, CheckCircle2, Loader2, AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const collegeId = 'study-connect-college';

const FACULTY_CSV_COLUMNS: CsvColumn[] = [
  { key: 'firstName', label: 'First Name', description: 'Legal first name.', example: 'Sarah', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name.', example: 'Smith', required: true },
  { key: 'email', label: 'System Email', description: 'Authentication email.', example: 'sarah.s@college.edu', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'ID of the department.', example: 'dept-eng', required: true },
  { key: 'designation', label: 'Designation', description: 'Job title.', example: 'Professor', required: false },
];

const deptColors: Record<string, string> = {
  'Engineering': 'bg-blue-500/10 text-blue-500',
  'Arts & Design': 'bg-purple-500/10 text-purple-500',
  'Management': 'bg-amber-500/10 text-amber-500',
  'Applied Sciences': 'bg-emerald-500/10 text-emerald-500',
  'General': 'bg-muted-foreground/10 text-muted-foreground'
};

export default function FacultyManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  
  const firestore = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  // Role-gated queries
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, isAdmin]);

  const deptsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore, isAdmin]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: departments } = useCollection(deptsQuery);

  const faculty = users?.filter(u => u.role === 'faculty') || [];

  const filteredFaculty = faculty.filter(f => 
    `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Unauthorized</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">The faculty directory is a protected administrative module. Only verified admins can manage staff assignments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Faculty Directory</h1>
          <p className="text-muted-foreground mt-1">Live directory of academic staff and assignments.</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Import Faculty Roster"
            description="Quickly onboard staff by uploading a CSV with names, emails, and department mapping."
            columns={FACULTY_CSV_COLUMNS}
          />
          <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
            <Plus className="h-4 w-4" /> Add Faculty Member
          </Button>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          className="pl-10 bg-card border-none shadow-sm h-11 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {usersLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => {
            const dept = departments?.find(d => d.id === member.departmentId);
            const deptName = dept?.name || 'Academic Faculty';
            const colorClass = deptColors[deptName] || deptColors['General'];

            return (
              <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card rounded-[2rem]">
                <div className={cn("h-1.5 w-full bg-primary/20")} />
                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-sm ring-1 ring-border">
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                      {member.firstName?.[0] || 'F'}{member.lastName?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 pt-1">
                    <CardTitle className="text-lg font-headline font-bold text-foreground">
                      Dr. {member.firstName} {member.lastName}
                    </CardTitle>
                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase border-none", colorClass)}>
                      {deptName}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl bg-card border-border shadow-xl">
                      <DropdownMenuItem className="gap-2" onClick={() => {setSelectedFaculty(member); setIsEditOpen(true);}}>
                        <Edit3 className="h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 opacity-40" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" /> Staff ID
                    </div>
                    <p className="text-xs font-mono font-bold text-primary">#{member.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 rounded-lg">
                    <Briefcase className="h-3.5 w-3.5" /> Assign
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 text-primary rounded-lg hover:bg-primary/5">
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {filteredFaculty.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No faculty members found in the directory.
            </div>
          )}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2rem] bg-card border-none">
          <DialogHeader>
            <DialogTitle>Edit Faculty Profile</DialogTitle>
            <DialogDescription>Update institutional record for Dr. {selectedFaculty?.firstName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                <Input defaultValue={selectedFaculty?.firstName} className="bg-muted border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                <Input defaultValue={selectedFaculty?.lastName} className="bg-muted border-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Department</Label>
              <Select defaultValue={selectedFaculty?.departmentId}>
                <SelectTrigger className="bg-muted border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full h-12 font-bold shadow-lg shadow-primary/20" onClick={() => {toast({ title: 'Record Updated', description: 'Faculty profile saved to database.' }); setIsEditOpen(false);}}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
