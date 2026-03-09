'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, collection } from 'firebase/firestore';
import { useUser, useFirestore, setDocumentNonBlocking, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Users, Search, MoreHorizontal, Plus, GraduationCap, ShieldCheck, UserCog, Edit, Trash, Eye, Mail, Fingerprint, Lock, ShieldAlert, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const collegeId = 'study-connect-college';

export default function UserManagementPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // Create User State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // View/Edit User State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const emailStr = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = fullName.includes(query) || emailStr.includes(query);
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/login');
    }
  }, [authUser, isUserLoading, router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'All fields are required.' });
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = email.toLowerCase().trim();
    const userRef = doc(firestore, 'colleges', collegeId, 'users', cleanEmail);
    
    setDocumentNonBlocking(userRef, {
      id: cleanEmail,
      collegeId: collegeId,
      email: cleanEmail,
      password, 
      firstName,
      lastName,
      role,
      status,
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'User Record Created', description: `${firstName} ${lastName} has been added.` });
    resetCreateForm();
    setIsSubmitting(false);
    setIsCreateOpen(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    const cleanEmail = editEmail.toLowerCase().trim();
    
    const updateData: any = {
      firstName: editFirstName,
      lastName: editLastName,
      email: cleanEmail,
      role: editRole,
      status: editStatus,
      password: editPassword,
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(userRef, updateData, { merge: true });

    toast({ title: 'Record Updated', description: `${editFirstName} ${editLastName}'s profile has been updated.` });
    setIsSubmitting(false);
    setIsEditOpen(false);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
      deleteDocumentNonBlocking(userRef);
      toast({ title: 'User Deleted', description: `${name} has been removed.` });
    }
  };

  const resetCreateForm = () => {
    setEmail(''); setFirstName(''); setLastName(''); setRole('student'); setPassword(''); setStatus('active');
  };

  const openView = (user: any) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditEmail(user.email || '');
    setEditPassword(user.password || '');
    setEditRole(user.role || 'student');
    setEditStatus(user.status || 'active');
    setIsEditOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard.` });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Directory</h1>
          <p className="text-muted-foreground mt-1">Manage access control for students, faculty, and administrative staff.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Register New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> Provision User
                </DialogTitle>
                <DialogDescription>
                  Create a new institutional record. Normalization will be applied to the email.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Security Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20" placeholder="Set initial password" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Access Role</Label>
                    <Select onValueChange={(v: any) => setRole(v)} defaultValue={role}>
                      <SelectTrigger id="role" className="bg-slate-50 border-none focus-visible:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Account Status</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch 
                        checked={status === 'active'} 
                        onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')} 
                      />
                      <span className="text-xs font-medium capitalize">{status}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full shadow-md shadow-primary/20 font-bold mt-2" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Create Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-white border shadow-sm h-11 p-1">
            <TabsTrigger value="all" className="gap-2 px-4"><Users className="h-4 w-4" /> All Users</TabsTrigger>
            <TabsTrigger value="student" className="gap-2 px-4"><GraduationCap className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 px-4"><UserCog className="h-4 w-4" /> Faculty</TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 px-4"><ShieldCheck className="h-4 w-4" /> Admins</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search records..." 
              className="pl-10 bg-white border-none shadow-sm focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            {isUsersLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[300px] font-bold text-slate-900 py-4">User Details</TableHead>
                    <TableHead className="font-bold text-slate-900">Portal Role</TableHead>
                    <TableHead className="font-bold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-900 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((u) => (
                    <TableRow key={u.id} className="group transition-colors hover:bg-slate-50/50 border-slate-100">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 leading-tight">{u.firstName} {u.lastName}</span>
                            <span className="text-xs text-muted-foreground mt-0.5">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5",
                            u.role === 'admin' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            u.role === 'faculty' ? "bg-purple-50 text-purple-600 border-purple-100" :
                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'inactive' ? 'bg-slate-400' : 'bg-emerald-500')} />
                            <span className="text-xs font-semibold text-slate-600 capitalize">{u.status || 'active'}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full h-8 w-8">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openView(u)}>
                              <Eye className="h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(u)}>
                              <Edit className="h-4 w-4" /> Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                            >
                              <Trash className="h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No user records found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* View User Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(open) => {
        setIsViewOpen(open);
        if (!open) setSelectedUser(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Profile Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge className="uppercase text-[10px] font-bold tracking-widest">{selectedUser.role}</Badge>
                    <Badge variant="outline" className={cn("uppercase text-[10px] font-bold tracking-widest", selectedUser.status === 'inactive' ? 'text-slate-400' : 'text-emerald-500 border-emerald-100')}>
                      {selectedUser.status || 'active'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 bg-slate-50 p-4 rounded-xl border">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</span>
                      <span className="text-sm font-medium">{selectedUser.email}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedUser.email, 'Email')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Internal UID</span>
                      <span className="text-sm font-mono truncate">{selectedUser.id}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedUser.id, 'UID')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-primary/70 tracking-tighter">Initial Password (Admin Only)</span>
                        <span className="text-sm font-mono font-bold text-primary">{selectedUser.password || 'Not Set'}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8 border-primary/20 hover:bg-primary/10" onClick={() => copyToClipboard(selectedUser.password, 'Password')}>
                      <Copy className="h-3 w-3 text-primary" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> This password is used for the user's first login bootstrap.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">Close Profile</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) setSelectedUser(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" /> Modify Record
            </DialogTitle>
            <DialogDescription>Update institutional data and security settings for this account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editFirstName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">First Name</Label>
                <Input id="editFirstName" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required className="bg-slate-50 border-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Last Name</Label>
                <Input id="editLastName" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required className="bg-slate-50 border-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Email Address</Label>
              <Input id="editEmail" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required className="bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPass" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Current/New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="editPass" type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Enter password" className="pl-10 bg-slate-50 border-none font-mono" />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Plaintext password for administrative reference.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editRole" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Access Role</Label>
                <Select onValueChange={(v: any) => setEditRole(v)} defaultValue={editRole}>
                  <SelectTrigger id="editRole" className="bg-slate-50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Account Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch 
                    checked={editStatus === 'active'} 
                    onCheckedChange={(checked) => setEditStatus(checked ? 'active' : 'inactive')} 
                  />
                  <span className="text-xs font-medium capitalize">{editStatus}</span>
                </div>
              </div>
            </div>
            <Button className="w-full shadow-md shadow-primary/20 font-bold mt-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}