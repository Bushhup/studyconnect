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
import { Loader2, UserPlus, Users, Search, MoreHorizontal, Plus, GraduationCap, ShieldCheck, UserCog, Edit, Trash, Eye, Mail, Fingerprint } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

export default function UserManagementPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // Create User State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [tempId, setTempId] = useState('');
  
  // View/Edit User State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'faculty' | 'admin'>('student');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (!email || !firstName || !lastName || !tempId) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'All fields are required.' });
      return;
    }

    setIsSubmitting(true);
    const userRef = doc(firestore, 'colleges', collegeId, 'users', tempId);
    
    setDocumentNonBlocking(userRef, {
      id: tempId,
      collegeId: collegeId,
      email,
      firstName,
      lastName,
      role,
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
    
    setDocumentNonBlocking(userRef, {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      role: editRole,
    }, { merge: true });

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
    setEmail(''); setFirstName(''); setLastName(''); setTempId(''); setRole('student');
  };

  const openView = (user: any) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditRole(user.role);
    setIsEditOpen(true);
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
                  Create a new institutional record. Use the Firebase Auth UID to link this profile.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Authentication UID</Label>
                  <Input id="id" placeholder="Firebase Auth UID" value={tempId} onChange={(e) => setTempId(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                </div>
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
                              {u.firstName[0]}{u.lastName[0]}
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
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-semibold text-slate-600">Active</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
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
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* View User Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
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
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <Badge className="mt-1 uppercase text-[10px] font-bold tracking-widest">{selectedUser.role}</Badge>
                </div>
              </div>
              <div className="grid gap-4 bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</span>
                    <span className="text-sm font-medium">{selectedUser.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Internal UID</span>
                    <span className="text-sm font-mono truncate">{selectedUser.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)} className="w-full">Close Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" /> Modify Record
            </DialogTitle>
            <DialogDescription>Update institutional data for this account.</DialogDescription>
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
