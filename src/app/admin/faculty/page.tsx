'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, Plus, Mail, BookOpen, 
  MessageSquare, Edit3, MoreHorizontal, 
  Briefcase, CheckCircle2, Loader2, AlertCircle,
  FileSpreadsheet, FileUser, Save, GraduationCap,
  Award, TrendingUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const collegeId = 'study-connect-college';

const FACULTY_CSV_COLUMNS: CsvColumn[] = [
  { key: 'firstName', label: 'First Name', description: 'Legal first name.', example: 'Sarah', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name.', example: 'Smith', required: true },
  { key: 'email', label: 'System Email', description: 'Authentication email.', example: 'sarah.s@college.edu', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'ID of the department.', example: 'dept-eng', required: true },
  { key: 'designation', label: 'Designation', description: 'Job title.', example: 'Professor', required: false },
];

export default function FacultyManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const firestore = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();

  // FIX: Using email instead of uid for the directory lookup
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

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

  // Detailed Profile Fetching
  const selectedProfileRef = useMemoFirebase(() => {
    if (!firestore || !selectedFacultyId) return null;
    return doc(firestore, 'colleges', collegeId, 'facultyProfiles', selectedFacultyId);
  }, [firestore, selectedFacultyId]);
  const { data: detailedProfile, isLoading: detailLoading } = useDoc(selectedProfileRef);

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProfileRef) return;
    
    const formData = new FormData(e.currentTarget);
    const updates: any = {};
    formData.forEach((value, key) => {
      updates[key] = value;
    });

    setDocumentNonBlocking(selectedProfileRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Staff Record Updated', description: 'Professional profile has been synchronized.' });
    setIsEditing(false);
  };

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
      <div className="flex flex-col items-center justify-center p-40 text-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Unauthorized Access</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to access the faculty directory.</p>
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
        <div className="p-20 text-center flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retrieving Roster...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => {
            const dept = departments?.find(d => d.id === member.departmentId);
            return (
              <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card rounded-[2rem]">
                <div className="h-1.5 w-full bg-primary/20" />
                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-sm ring-1 ring-border">
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold uppercase">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 pt-1">
                    <CardTitle className="text-lg font-headline font-bold text-foreground truncate">
                      Dr. {member.firstName} {member.lastName}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase border-none bg-primary/5 text-primary">
                      {dept?.name || 'General Faculty'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-4 w-4 opacity-40" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Employee ID</p>
                    <p className="text-xs font-mono font-bold text-primary">#{member.id.split('@')[0].toUpperCase()}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 rounded-xl h-10" onClick={() => setSelectedFacultyId(member.id)}>
                    <FileUser className="h-4 w-4 text-primary" /> View Detailed Profile
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {filteredFaculty.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
              <p className="font-bold text-foreground">No faculty records found.</p>
              <p className="text-xs text-muted-foreground mt-1">Try running "System Bootstrap" to seed initial staff data.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selectedFacultyId} onOpenChange={(o) => !o && setSelectedFacultyId(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="font-headline text-2xl">Staff Professional Registry</DialogTitle>
            <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px]" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel Edit' : 'Modify Record'}
            </Button>
          </DialogHeader>

          {detailLoading ? <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div> : (
            <form onSubmit={handleUpdateProfile} className="space-y-8 pt-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="bg-muted h-12 p-1 rounded-xl mb-6">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="edu">Education</TabsTrigger>
                  <TabsTrigger value="pro">Professional</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Full Name</Label>
                      <Input name="fullName" defaultValue={detailedProfile?.fullName} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase">Gender</Label>
                        <Input name="gender" defaultValue={detailedProfile?.gender || 'N/A'} disabled={!isEditing} className="bg-muted border-none h-11" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase">Blood Group</Label>
                        <Input name="bloodGroup" defaultValue={detailedProfile?.bloodGroup || 'N/A'} disabled={!isEditing} className="bg-muted border-none h-11" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Aadhar Number</Label>
                      <Input name="aadharNumber" defaultValue={detailedProfile?.aadharNumber || 'N/A'} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Mobile Number</Label>
                      <Input name="mobileNumber" defaultValue={detailedProfile?.mobileNumber || 'N/A'} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="edu" className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">UG Degree</Label>
                      <Input name="ugDegree" defaultValue={detailedProfile?.ugDegree} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">PG Degree</Label>
                      <Input name="pgDegree" defaultValue={detailedProfile?.pgDegree} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">PhD Specialization</Label>
                      <Input name="phdSpecialization" defaultValue={detailedProfile?.phdSpecialization} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Domain Specialization</Label>
                      <Input name="specialization" defaultValue={detailedProfile?.specialization} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pro" className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Designation</Label>
                      <Input name="designation" defaultValue={detailedProfile?.designation} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Employment Type</Label>
                      <Input name="employmentType" defaultValue={detailedProfile?.employmentType} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Experience (Years)</Label>
                      <Input name="yearsOfExperience" type="number" defaultValue={detailedProfile?.yearsOfExperience} disabled={!isEditing} className="bg-muted border-none h-11" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase">Employee ID (Locked)</Label>
                      <Input value={detailedProfile?.employeeId} disabled className="bg-muted border-none h-11 opacity-60" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {isEditing && (
                <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase shadow-lg shadow-primary/20">
                  <Save className="mr-2 h-4 w-4" /> Synchronize Staff Record
                </Button>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
