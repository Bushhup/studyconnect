
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  useCollection, 
  useDoc,
  useMemoFirebase, 
  useFirestore, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  useUser
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Users, Search, MoreHorizontal, Plus, 
  GraduationCap, ShieldCheck, UserCog, Edit3, 
  Eye, EyeOff, Trash2, Loader2, CheckCircle2, Lock, AlertCircle,
  AtSign, ArrowRight, FileUser, RefreshCcw, Key, Layers
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const collegeId = 'study-connect-college';

const USER_CSV_COLUMNS: CsvColumn[] = [
  { key: 'username', label: 'Institutional Username', description: 'Unique portal ID for the user.', example: 'stu_2024_001', required: true },
  { key: 'firstName', label: 'First Name', description: 'Legal first name of the individual.', example: 'Alex', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name of the individual.', example: 'Johnson', required: true },
  { key: 'email', label: 'System Email', description: 'Email used for authentication.', example: 'alex.j@college.edu', required: true },
  { key: 'password', label: 'Initial Password', description: 'Default temporary login password.', example: 'Welcome@123', required: true },
  { key: 'role', label: 'System Role', description: 'Access level (student, faculty, admin).', example: 'student', required: true },
  { key: 'batchYear', label: 'Batch Year', description: 'Student batch year (e.g. Batch-2026).', example: 'Batch-2026', required: false },
  { key: 'status', label: 'Account Status', description: 'Current state (active, inactive).', example: 'active', required: false },
];

export default function UserManagementPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    batchYear: '',
    status: 'active'
  });

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, user]);

  const { data: users, isLoading: collectionLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  }) || [];

  const isAdmin = profile?.role === 'admin';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const userId = crypto.randomUUID();
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    
    setDocumentNonBlocking(userRef, {
      ...formData,
      id: userId,
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'User Provisioned', description: `@${formData.username} registered.` });
    setIsAddOpen(false);
    setFormData({ username: '', firstName: '', lastName: '', email: '', password: '', role: 'student', batchYear: '', status: 'active' });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, { ...formData });

    toast({ title: 'Profile Updated', description: 'Changes synchronized with directory.' });
    setIsEditOpen(false);
  };

  const isDataLoading = authLoading || profileLoading || collectionLoading;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Institutional Directory</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access control and student batches.</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <CsvImportDialog 
              title="Bulk Provision Users"
              description="Upload a CSV file to register multiple students, faculty, or staff."
              columns={USER_CSV_COLUMNS}
            />
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
                  <Plus className="h-4 w-4" /> Register New User
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem]">
                <DialogHeader><DialogTitle>Register Identity</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Institutional Username</Label>
                    <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="bg-muted border-none h-12" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">First Name</Label>
                      <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-muted border-none h-12" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Last Name</Label>
                      <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-muted border-none h-12" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Portal Role</Label>
                    <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                      <SelectTrigger className="bg-muted border-none h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.role === 'student' && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Batch Group</Label>
                      <Input placeholder="e.g. Batch-2026" value={formData.batchYear} onChange={(e) => setFormData({...formData, batchYear: e.target.value})} className="bg-muted border-none h-12" />
                    </div>
                  )}
                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-xl">Confirm Provisioning</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-card border h-11 p-1 rounded-xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="student">Students</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search records..." className="pl-10 h-11 rounded-xl border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardContent className="p-0">
            {isDataLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-6 py-4">Identity</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Batch / Status</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="group hover:bg-muted/30">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10"><AvatarFallback>{u.firstName?.[0]}</AvatarFallback></Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{u.firstName} {u.lastName}</span>
                            <span className="text-[10px] font-bold text-primary uppercase">@{u.username}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-bold uppercase text-[9px] border-none">{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {u.batchYear && <Badge variant="outline" className="text-[8px] border-primary/20 text-primary w-fit px-1">{u.batchYear}</Badge>}
                          <span className={cn("text-[10px] font-bold uppercase", u.status === 'alumni' ? "text-amber-600" : "text-emerald-600")}>{u.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" onClick={() => {setSelectedUser(u); setFormData({...u}); setIsEditOpen(true);}}><Edit3 className="h-4 w-4 text-muted-foreground" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Batch Year</Label>
              <Input value={formData.batchYear} onChange={(e) => setFormData({...formData, batchYear: e.target.value})} className="bg-muted border-none h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Status</Label>
              <Select onValueChange={(v) => setFormData({...formData, status: v})} value={formData.status}>
                <SelectTrigger className="bg-muted border-none h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-xl">Update Record</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
