'use client';

import { useState } from 'react';
import { 
  useCollection, 
  useMemoFirebase, 
  useFirestore, 
  updateDocumentNonBlocking, 
  setDocumentNonBlocking,
  useUser,
  deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Plus, UserCog, Edit3, 
  Loader2, Globe, Mail, Phone, Lock, Trash2, ShieldCheck, UserCheck
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { motion, AnimatePresence } from 'framer-motion';

const collegeId = 'study-connect-college';

const USER_CSV_COLUMNS: CsvColumn[] = [
  { key: 'firstName', label: 'First Name', description: 'Legal first name.', example: 'Alex', required: true },
  { key: 'lastName', label: 'Last Name', description: 'Legal last name.', example: 'Johnson', required: true },
  { key: 'email', label: 'System Email', description: 'Email used for authentication.', example: 'alex.j@college.edu', required: true },
  { key: 'mobileNumber', label: 'Mobile Number', description: 'Institutional contact number.', example: '9876543210', required: true },
  { key: 'role', label: 'System Role', description: 'Access level (student, faculty, admin, hod).', example: 'student', required: true },
  { key: 'departmentId', label: 'Dept ID', description: 'Mapping to a department.', example: 'dept-eng', required: false },
];

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    role: 'student',
    departmentId: '',
    batchYear: '',
    status: 'active'
  });

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, user]);

  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);

  const { data: users, isLoading: collectionLoading } = useCollection(usersQuery);
  const { data: departments } = useCollection(deptsQuery);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    const emailKey = formData.email.toLowerCase().trim();
    const userRef = doc(firestore, 'colleges', collegeId, 'users', emailKey);
    
    setDocumentNonBlocking(userRef, {
      ...formData,
      id: emailKey,
      email: emailKey,
      username: emailKey.split('@')[0],
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Identity Provisioned', description: `User ${formData.firstName} has been added to the directory.` });
    setIsAddOpen(false);
    setFormData({ username: '', firstName: '', lastName: '', email: '', mobileNumber: '', role: 'student', departmentId: '', batchYear: '', status: 'active' });
  };

  const handleDeleteUser = (userId: string) => {
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    deleteDocumentNonBlocking(userRef);
    toast({ title: 'Identity Terminated', description: 'User has been removed from the institutional directory.' });
  };

  const handleEditClick = (u: any) => {
    setSelectedUser(u);
    setFormData({ ...u });
    setIsEditOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, { ...formData, updatedAt: new Date().toISOString() });

    toast({ title: 'Record Updated', description: 'User information has been synchronized.' });
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Identity Hub</h1>
          <p className="text-muted-foreground mt-1">Onboard staff and students by provisioning their institutional profiles.</p>
        </motion.div>
        
        <div className="flex gap-2">
          <CsvImportDialog 
            title="Bulk Provisioning"
            description="Process multiple user records via CSV mapping."
            columns={USER_CSV_COLUMNS}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
                <Plus className="h-4 w-4" /> Provision New Identity
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-2xl border-none">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-primary" /> Onboard Institutional User</DialogTitle>
                <DialogDescription>Assign a system role and department to initialize the identity.</DialogDescription>
              </DialogHeader>
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
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-muted border-none h-12 rounded-xl" required placeholder="alex@college.edu" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                    <Input value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} className="bg-muted border-none h-12 rounded-xl" required placeholder="9876543210" />
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
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department Mapping</Label>
                    <Select onValueChange={(val) => setFormData({...formData, departmentId: val})} value={formData.departmentId}>
                      <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Select Department" /></SelectTrigger>
                      <SelectContent>
                        {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
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
            <TabsTrigger value="all" className="px-6 rounded-lg">All Records</TabsTrigger>
            <TabsTrigger value="student" className="px-6 rounded-lg">Students</TabsTrigger>
            <TabsTrigger value="faculty" className="px-6 rounded-lg">Faculty</TabsTrigger>
            <TabsTrigger value="hod" className="px-6 rounded-lg">Heads</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter by name or email..." className="pl-10 h-11 rounded-xl border-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                    <TableHead className="pl-6 py-4 font-bold text-foreground">Institutional Identity</TableHead>
                    <TableHead className="font-bold text-foreground">Department & Status</TableHead>
                    <TableHead className="font-bold text-foreground">Access Level</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-foreground">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredUsers.map((u, idx) => (
                      <TableRow key={u.id} className="group hover:bg-muted/30 border-border">
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                              <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">{u.firstName} {u.lastName}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                              {departments?.find(d => d.id === u.departmentId)?.name || 'Not Assigned'}
                            </span>
                            <Badge variant="secondary" className={cn("font-bold uppercase text-[8px] w-fit px-1.5", u.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                              {u.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold uppercase text-[9px] border-primary/20 text-primary py-1 px-3 rounded-md">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 text-primary" onClick={() => handleEditClick(u)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 text-red-500" onClick={() => handleDeleteUser(u.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-20 text-center text-muted-foreground italic">No institutional records matching the filter.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl border-none">
          <DialogHeader><DialogTitle>Modify Identity Record</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-muted border-none h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-muted border-none h-12 rounded-xl" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Email Address</Label>
              <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-muted border-none h-12 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">System Role</Label>
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
                <Label className="text-[10px] font-bold uppercase">Department</Label>
                <Select onValueChange={(val) => setFormData({...formData, departmentId: val})} value={formData.departmentId}>
                  <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Assign Department" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Enrollment Status</Label>
              <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-14 font-bold uppercase tracking-tight shadow-lg shadow-primary/20 rounded-2xl">
              Synchronize Record
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}