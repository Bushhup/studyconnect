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
  AtSign, ArrowRight, FileUser, Sparkles, RefreshCcw,
  Key
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
    status: 'active'
  });

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user || authLoading || profileLoading || !profile || profile.role !== 'admin') {
      return null;
    }
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, user, authLoading, profileLoading, profile]);

  const { data: users, isLoading: collectionLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const emailStr = u.email?.toLowerCase() || '';
    const usernameStr = u.username?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || emailStr.includes(query) || usernameStr.includes(query);
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  }) || [];

  const isAdmin = profile?.role === 'admin';

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleDeduplicate = () => {
    if (!users || users.length === 0) return;
    
    const emailMap = new Map<string, any>();
    const usernameMap = new Map<string, any>();
    const toDeleteIds = new Set<string>();

    users.forEach(u => {
      const email = u.email?.toLowerCase();
      const username = u.username?.toLowerCase();

      // Check Email Duplicates
      if (email) {
        if (emailMap.has(email)) {
          const existing = emailMap.get(email);
          // Keep the one that is bootstrapped or simply newer
          if (u.authBootstrapped && !existing.authBootstrapped) {
            toDeleteIds.add(existing.id);
            emailMap.set(email, u);
          } else {
            toDeleteIds.add(u.id);
          }
        } else {
          emailMap.set(email, u);
        }
      }

      // Check Username Duplicates
      if (username) {
        if (usernameMap.has(username)) {
          const existing = usernameMap.get(username);
          if (u.authBootstrapped && !existing.authBootstrapped) {
            toDeleteIds.add(existing.id);
            usernameMap.set(username, u);
          } else if (!toDeleteIds.has(existing.id)) {
            toDeleteIds.add(u.id);
          }
        } else {
          usernameMap.set(username, u);
        }
      }
    });

    if (toDeleteIds.size === 0) {
      toast({
        title: 'Directory is Clean',
        description: 'No duplicate usernames or emails detected in the system.'
      });
      return;
    }

    // Perform deletions
    Array.from(toDeleteIds).forEach(id => {
      const ref = doc(firestore, 'colleges', collegeId, 'users', id);
      deleteDocumentNonBlocking(ref);
    });

    toast({
      title: 'Cleanup Complete',
      description: `Successfully removed ${toDeleteIds.size} duplicate institutional records.`
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !isAdmin) return;
    if (!formData.username || !formData.email || !formData.password) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Institutional Username, Email, and Password are required.' });
      return;
    }

    // Duplicate Prevention check
    const isConflict = users?.some(u => 
      u.username?.toLowerCase() === formData.username.toLowerCase() || 
      u.email?.toLowerCase() === formData.email.toLowerCase()
    );

    if (isConflict) {
      toast({
        variant: 'destructive',
        title: 'Identity Conflict',
        description: 'A user with this username or email already exists in the institutional directory.'
      });
      return;
    }

    const userId = crypto.randomUUID();
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    
    setDocumentNonBlocking(userRef, {
      ...formData,
      id: userId,
      collegeId,
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ 
      title: 'User Provisioned', 
      description: `@${formData.username} has been added to the institutional directory.` 
    });
    
    setIsAddOpen(false);
    setFormData({ username: '', firstName: '', lastName: '', email: '', password: '', role: 'student', status: 'active' });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !selectedUser || !isAdmin) return;

    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      status: formData.status,
      username: formData.username,
      password: formData.password
    });

    toast({ title: 'Record Synchronized', description: 'User information has been updated.' });
    setIsEditOpen(false);
  };

  const handleDeleteUser = () => {
    if (!firestore || !selectedUser || !isAdmin) return;
    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    deleteDocumentNonBlocking(userRef);
    toast({ title: 'User De-provisioned', description: 'The institutional record has been removed.' });
    setIsDeleteOpen(false);
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: user.password || '',
      role: user.role || 'student',
      status: user.status || 'active'
    });
    setIsEditOpen(true);
  };

  const openView = (user: any) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const isDataLoading = authLoading || profileLoading || (!!usersQuery && collectionLoading);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Institutional Directory</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access control and user records via usernames.</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-full border-primary/20 text-primary font-bold hover:bg-primary/5" onClick={handleDeduplicate}>
              <RefreshCcw className="h-4 w-4" /> Clean Directory
            </Button>
            <CsvImportDialog 
              title="Bulk Provision Users"
              description="Upload a CSV file to register multiple students, faculty, or staff at once."
              columns={USER_CSV_COLUMNS}
            />
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
                  <Plus className="h-4 w-4" /> Register New User
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] bg-card border-none">
                <DialogHeader>
                  <DialogTitle>Register Institutional Identity</DialogTitle>
                  <DialogDescription>Assign a unique username and temporary credentials.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <AtSign className="h-3 w-3 text-primary" /> Unique Username
                    </Label>
                    <Input 
                      placeholder="e.g. student_2024_01"
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})} 
                      className="bg-muted border-none h-12 rounded-xl" required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                      <Input 
                        value={formData.firstName} 
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                        className="bg-muted border-none h-12 rounded-xl" required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                      <Input 
                        value={formData.lastName} 
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                        className="bg-muted border-none h-12 rounded-xl" required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address (For System Auth)</Label>
                    <Input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="bg-muted border-none h-12 rounded-xl" required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Lock className="h-3 w-3 text-primary" /> Initial Password
                    </Label>
                    <Input 
                      type="password" 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      className="bg-muted border-none h-12 rounded-xl" required 
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portal Role</Label>
                      <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                        <SelectTrigger className="bg-muted border-none shadow-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                      <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                        <SelectTrigger className="bg-muted border-none shadow-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2 rounded-xl">
                    Confirm Provisioning
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-card hover:shadow-md transition-all group rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-2">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-headline">Faculty Directory</CardTitle>
            <CardDescription>Manage academic staff and department assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="p-0 font-bold text-primary group-hover:translate-x-1 transition-transform">
              <Link href="/admin/faculty">Open Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card hover:shadow-md transition-all group rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit mb-2">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-headline">Student Directory</CardTitle>
            <CardDescription>Track enrollment and performance metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="p-0 font-bold text-primary group-hover:translate-x-1 transition-transform">
              <Link href="/admin/students">Open Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card hover:shadow-md transition-all group rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit mb-2">
              <FileUser className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-headline">Student Bio-Data</CardTitle>
            <CardDescription>Verified biographical records and ID registries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="p-0 font-bold text-primary group-hover:translate-x-1 transition-transform">
              <Link href="/admin/students">Access Registry <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-card border h-11 p-1 rounded-xl">
            <TabsTrigger value="all" className="gap-2 px-4 rounded-lg"><Users className="h-4 w-4" /> All</TabsTrigger>
            <TabsTrigger value="student" className="gap-2 px-4 rounded-lg"><GraduationCap className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 px-4 rounded-lg"><UserCog className="h-4 w-4" /> Faculty</TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 px-4 rounded-lg"><ShieldCheck className="h-4 w-4" /> Admins</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or username..." 
              className="pl-10 bg-card border shadow-sm h-11 rounded-xl focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2rem]">
          <CardContent className="p-0">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing directory...</p>
              </div>
            ) : !isAdmin ? (
               <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                  <div>
                    <p className="font-bold text-foreground">Authorization Denied</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">Only verified administrators can access the institutional directory.</p>
                  </div>
               </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[300px] font-bold text-foreground py-4 pl-6">Institutional Identity</TableHead>
                    <TableHead className="font-bold text-foreground">Portal Role</TableHead>
                    <TableHead className="font-bold text-foreground">Security Password</TableHead>
                    <TableHead className="font-bold text-foreground">Status</TableHead>
                    <TableHead className="text-right font-bold text-foreground pr-6">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="group transition-colors hover:bg-muted/50 border-border">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground leading-tight">{u.firstName} {u.lastName}</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">@{u.username}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 border-none",
                            u.role === 'admin' ? "bg-blue-500/10 text-blue-500" :
                            u.role === 'faculty' ? "bg-purple-500/10 text-purple-500" :
                            "bg-emerald-500/10 text-emerald-500"
                          )}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-3 w-3 text-muted-foreground" />
                          <code className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded min-w-[80px] inline-block">
                            {visiblePasswords.has(u.id) ? (u.password || 'N/A') : '••••••••'}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full"
                            onClick={() => togglePasswordVisibility(u.id)}
                          >
                            {visiblePasswords.has(u.id) ? (
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Eye className="h-3 w-3 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'inactive' ? 'bg-muted-foreground/30' : 'bg-emerald-500')} />
                            <span className="text-xs font-semibold text-muted-foreground capitalize">{u.status}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full h-8 w-8">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card border-border shadow-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openView(u)}>
                              <Eye className="h-4 w-4" /> View ID Card
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(u)}>
                              <Edit3 className="h-4 w-4" /> Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:bg-destructive/10" onClick={() => openDelete(u)}>
                              <Trash2 className="h-4 w-4" /> Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && !isDataLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                        No institutional records match your search.
                      </TableCell>
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
        <DialogContent className="rounded-[2rem] bg-card border-none">
          <DialogHeader>
            <DialogTitle>Update Institutional Record</DialogTitle>
            <DialogDescription>Synchronizing permissions for @{selectedUser?.username}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Institutional Username</Label>
              <Input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                className="bg-muted border-none h-12 rounded-xl font-bold text-primary" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-muted border-none h-12 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-muted border-none h-12 rounded-xl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reset Password</Label>
              <Input 
                type="text"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className="bg-muted border-none h-12 rounded-xl font-mono" 
                placeholder="Enter new password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portal Role</Label>
                <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                  <SelectTrigger className="bg-muted border-none shadow-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                  <SelectTrigger className="bg-muted border-none shadow-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2 rounded-xl">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Apply Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-[2rem] bg-card border-none">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Institutional Identity Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
              <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-1 ring-primary/10">
                <AvatarFallback className="bg-white text-primary text-2xl font-bold">
                  {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold text-foreground leading-tight">{selectedUser?.firstName} {selectedUser?.lastName}</h3>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">@{selectedUser?.username}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="space-y-1 p-4 bg-muted/30 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Portal Access</p>
                <p className="capitalize text-foreground font-bold">{selectedUser?.role}</p>
              </div>
              <div className="space-y-1 p-4 bg-muted/30 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Account Status</p>
                <Badge className={cn(selectedUser?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground', "border-none font-bold uppercase text-[10px] h-6 px-3")}>
                  {selectedUser?.status}
                </Badge>
              </div>
            </div>
            <Button className="w-full h-12 rounded-xl" variant="outline" onClick={() => setIsViewOpen(false)}>Close Identity View</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[2rem] bg-card border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline">Institutional De-provisioning</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Confirm removal of <strong>@{selectedUser?.username}</strong> ({selectedUser?.firstName} {selectedUser?.lastName}). This action permanently deletes their institutional record and revokes portal access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-xl h-12 font-bold border-none bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 rounded-xl h-12 font-bold" onClick={handleDeleteUser}>
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
