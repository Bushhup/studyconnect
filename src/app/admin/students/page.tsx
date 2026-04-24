
'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  TrendingUp,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  FileUser,
  Save,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { StudentBioHover } from '@/components/StudentBioHover';
import { useToast } from '@/hooks/use-toast';

const collegeId = 'study-connect-college';

const STUDENT_CSV_COLUMNS: CsvColumn[] = [
  { key: 'firstName', label: 'First Name', description: 'Legal first name.', example: 'Alex', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name.', example: 'Johnson', required: true },
  { key: 'email', label: 'Institutional Email', description: 'Assigned student email.', example: 'alex.j@college.edu', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'ID of the department (e.g. dept-eng).', example: 'dept-eng', required: true },
  { key: 'status', label: 'Enrollment Status', description: 'active or inactive.', example: 'active', required: false },
];

export default function StudentManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, isAdmin]);

  const { data: users, isLoading: collectionLoading } = useCollection(studentsQuery);
  const students = users?.filter(u => u.role === 'student') || [];

  const handleExportData = () => {
    if (students.length === 0) return;
    
    const headers = ['First Name', 'Last Name', 'Email', 'Dept ID', 'Semester', 'Status'];
    const csvContent = [
      headers.join(','),
      ...students.map(s => [
        `"${s.firstName || ''}"`,
        `"${s.lastName || ''}"`,
        `"${s.email || ''}"`,
        `"${s.departmentId || ''}"`,
        `"${s.semester || ''}"`,
        `"${s.status || 'active'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `student_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Roster Exported', description: `Tabular data for ${students.length} students is ready.` });
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedBioRef = useMemoFirebase(() => {
    if (!firestore || !selectedStudentId) return null;
    return doc(firestore, 'colleges', collegeId, 'studentProfiles', selectedStudentId);
  }, [firestore, selectedStudentId]);
  const { data: bioData, isLoading: bioLoading } = useDoc(selectedBioRef);

  const handleUpdateBio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBioRef) return;
    const formData = new FormData(e.currentTarget);
    const updates: any = {};
    formData.forEach((value, key) => {
      updates[key] = value;
    });

    setDocumentNonBlocking(selectedBioRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Bio Data Updated', description: 'The institutional record has been synchronized.' });
    setIsEditing(false);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground">Only administrators can access the full student directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1 font-body">Live institutional records and performance monitoring.</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Bulk Enroll Students"
            description="Onboard an entire batch via CSV."
            columns={STUDENT_CSV_COLUMNS}
          />
          <Button onClick={handleExportData} variant="outline" className="gap-2 shadow-sm rounded-full h-11 bg-card border-primary/10 text-primary font-bold">
            <Download className="h-4 w-4" /> Export Roster
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              className="pl-10 bg-muted border-none h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-none">
                <TableHead className="font-bold pl-6">Student</TableHead>
                <TableHead className="font-bold">ID / Dept</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="group hover:bg-muted/50">
                  <TableCell className="py-4 pl-6">
                    <StudentBioHover student={student}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs uppercase">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-[10px] text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </StudentBioHover>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">
                      {student.departmentId || 'UNASSIGNED'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] border-none font-bold uppercase">{student.status || 'Active'}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" onClick={() => {setSelectedStudentId(student.id); setIsEditing(false);}}>
                      <FileUser className="h-4 w-4 text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && !collectionLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                    No student records found in the directory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedStudentId} onOpenChange={(o) => !o && setSelectedStudentId(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="font-headline text-2xl">Institutional Registry</DialogTitle>
            <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px]" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel Edit' : 'Modify Record'}
            </Button>
          </DialogHeader>
          
          {bioLoading ? <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div> : (
            <form onSubmit={handleUpdateBio} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Admission Date</Label>
                  <Input name="dateOfAdmission" type="date" defaultValue={bioData?.dateOfAdmission?.split('T')[0]} disabled={!isEditing} className="bg-muted border-none h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Gender</Label>
                  <Input name="gender" defaultValue={bioData?.gender} disabled={!isEditing} className="bg-muted border-none h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Aadhar Number</Label>
                  <Input name="aadharNumber" defaultValue={bioData?.aadharNumber} disabled={!isEditing} className="bg-muted border-none h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Guardian 1 (Father)</p>
                  <div className="grid gap-3">
                    <Input name="fatherName" placeholder="Name" defaultValue={bioData?.fatherName} disabled={!isEditing} className="bg-muted border-none h-10" />
                    <Input name="fatherOccupation" placeholder="Occupation" defaultValue={bioData?.fatherOccupation} disabled={!isEditing} className="bg-muted border-none h-10" />
                    <Input name="fatherAnnualIncome" placeholder="Income" defaultValue={bioData?.fatherAnnualIncome} disabled={!isEditing} className="bg-muted border-none h-10" />
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Guardian 2 (Mother)</p>
                  <div className="grid gap-3">
                    <Input name="motherName" placeholder="Name" defaultValue={bioData?.motherName} disabled={!isEditing} className="bg-muted border-none h-10" />
                    <Input name="motherOccupation" placeholder="Occupation" defaultValue={bioData?.motherOccupation} disabled={!isEditing} className="bg-muted border-none h-10" />
                    <Input name="motherAnnualIncome" placeholder="Income" defaultValue={bioData?.motherAnnualIncome} disabled={!isEditing} className="bg-muted border-none h-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dashed">
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Nationality</Label><Input value="Indian" disabled className="bg-muted border-none h-10" /></div>
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Community</Label><Input name="community" defaultValue={bioData?.community} disabled={!isEditing} className="bg-muted border-none h-10" /></div>
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Caste</Label><Input name="casteName" defaultValue={bioData?.casteName} disabled={!isEditing} className="bg-muted border-none h-10" /></div>
                <div className="space-y-1"><Label className="text-[10px] font-bold uppercase">Quota</Label><Input name="quota" defaultValue={bioData?.quota} disabled={!isEditing} className="bg-muted border-none h-10" /></div>
              </div>

              {isEditing && (
                <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase shadow-lg shadow-primary/20">
                  <Save className="mr-2 h-4 w-4" /> Save Record Updates
                </Button>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
