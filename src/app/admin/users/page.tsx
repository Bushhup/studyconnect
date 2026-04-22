
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  updateDocumentNonBlocking, 
  setDocumentNonBlocking,
  useUser
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Plus, UserCog, Edit3, 
  Loader2, Globe, Mail, Phone, Lock
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const collegeId = 'study-connect-college';

const USER_CSV_COLUMNS: CsvColumn[] = [
  { key: 'firstName', label: 'First Name', description: 'Legal first name.', example: 'Alex', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name.', example: 'Johnson', required: true },
  { key: 'email', label: 'System Email', description: 'Email used for authentication.', example: 'alex.j@college.edu', required: true },
  { key: 'mobileNumber', label: 'Mobile Number', description: 'Institutional contact number.', example: '9876543210', required: true },
  { key: 'password', label: 'Initial Password', description: 'Default temporary login password.', example: 'Welcome@123', required: true },
  { key: 'role', label: 'System Role', description: 'Access level (student, faculty, admin).', example: 'student', required: true },
  { key: 'batchYear', label: 'Batch Year', description: 'Student batch year (e.g. Batch-2026).', example: 'Batch-2026', required: false },
];

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'student',
    batchYear: '',
    status: 'active'
  });

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, user]);

  const { data: users, isLoading: collectionLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a temporary unique ID for pre-registration
    const userId = crypto.randomUUID();
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    
    setDocumentNonBlocking(userRef, {
      ...formData,
      id: userId,
      username: formData.email.split('@')[0], // Default username from email
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'User Pre-Registered', description: `${formData.firstName} can now authenticate via Google using ${formData.email}.` });
    setIsAddOpen(false);
    setFormData({ username: '', firstName: '', lastName: '', email: '', mobileNumber: '', password: '', role: 'student', batchYear: '', status: 'active' });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, { ...formData });

    toast({ title: 'Profile Updated', description: 'Directory record synchronized.' });
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Institutional Directory</h1>
          <p className="text-muted-foreground mt-1">Onboard staff and students by provisioning their email and credentials.</p>
        </div>
        
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Bulk Provision Users"
            description="Upload a CSV file to register multiple identities with names, emails, and mobile numbers."
            columns={USER_CSV_COLUMNS}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
                <Plus className="h-4 w-4" /> Provision New Identity
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-2xl">
              <DialogHeader><DialogTitle>Onboard Institutional User</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-muted border-none h-12 rounded-xl" required placeholder="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-muted border-none h-12 rounded-xl" required placeholder="Johnson" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Institutional Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="pl-10 bg-muted border-none h-12 rounded-xl" required placeholder="alex@college.edu" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} className="pl-10 bg-muted border-none h-12 rounded-xl" required placeholder="xxxxx xxxxx" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Role</Label>
                    <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                      <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="hod">H.O.D</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initial Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="pl-10 bg-muted border-none h-12 rounded-xl" required />
                    </div>
                  </div>
                </div>

                {formData.role === 'student' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Batch Year</Label>
                    <Input placeholder="e.g. Batch-2026" value={formData.batchYear} onChange={(e) => setFormData({...formData, batchYear: e.target.value})} className="bg-muted border-none h-12 rounded-xl" />
                  </div>
                )}

                <div className="pt-2 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
                    <Globe className="h-3 w-3" /> Note on Authentication
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pre-registering this email allows the user to securely link their Google account to this institutional identity during their first sign-in attempt.
                  </p>
                </div>

                <Button type="submit" className="w-full h-14 font-bold shadow-lg shadow-primary/20 rounded-2xl text-lg uppercase tracking-tight">
                  Finalize Provisioning
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-card border h-11 p-1 rounded-xl">
            <TabsTrigger value="all" className="px-6 rounded-lg">All</TabsTrigger>
            <TabsTrigger value="student" className="px-6 rounded-lg">Students</TabsTrigger>
            <TabsTrigger value="faculty" className="px-6 rounded-lg">Faculty</TabsTrigger>
            <TabsTrigger value="admin" className="px-6 rounded-lg">Admins</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search records by name or email..." className="pl-10 h-11 rounded-xl border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardContent className="p-0">
            {collectionLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-6 py-4 font-bold text-foreground">Identity</TableHead>
                    <TableHead className="font-bold text-foreground">Contact & Role</TableHead>
                    <TableHead className="font-bold text-foreground">Auth Status</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="group hover:bg-muted/30 border-border">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm"><AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback></Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{u.firstName} {u.lastName}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-foreground">{u.mobileNumber || 'No Contact'}</span>
                          <Badge variant="secondary" className="font-bold uppercase text-[9px] border-none w-fit px-1.5">{u.role}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {u.uid ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[9px] w-fit">LINKED (Google)</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] font-bold text-amber-600 border-amber-200 w-fit">PENDING AUTH</Badge>
                          )}
                          <span className={cn("text-[10px] font-bold uppercase", u.status === 'active' ? "text-emerald-500" : "text-muted-foreground")}>{u.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => {setSelectedUser(u); setFormData({...u}); setIsEditOpen(true);}}><Edit3 className="h-4 w-4 text-muted-foreground" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-20 text-center text-muted-foreground italic">No institutional records found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
