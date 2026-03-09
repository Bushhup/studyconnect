
'use client';

import { useState } from 'react';
import { 
  useCollection, 
  useDoc,
  useMemoFirebase, 
  useFirestore, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  useUser
} from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Eye, Trash2, Loader2, CheckCircle2, Lock 
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

const collegeId = 'study-connect-college';

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active'
  });

  // 1. Fetch the current user's profile first to ensure rules have context
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  // 2. Only query the collection if the profile is loaded and the user is an admin
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user || authLoading || profileLoading || !profile || profile.role !== 'admin') {
      return null;
    }
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore, user, authLoading, profileLoading, profile]);

  const { data: users, isLoading: collectionLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const emailStr = u.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || emailStr.includes(query);
    const matchesRole = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !formData.email || !formData.password) return;

    const userId = crypto.randomUUID();
    const userRef = doc(firestore, 'colleges', collegeId, 'users', userId);
    
    await setDoc(userRef, {
      ...formData,
      id: userId,
      collegeId,
      createdAt: new Date().toISOString()
    });

    toast({ title: 'User Registered', description: `${formData.firstName} has been added to the directory.` });
    setIsAddOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'student', status: 'active' });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !selectedUser) return;

    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      status: formData.status
    });

    toast({ title: 'Record Updated', description: 'User information has been synchronized.' });
    setIsEditOpen(false);
  };

  const handleDeleteUser = () => {
    if (!firestore || !selectedUser) return;
    const userRef = doc(firestore, 'colleges', collegeId, 'users', selectedUser.id);
    deleteDocumentNonBlocking(userRef);
    toast({ title: 'User Removed', description: 'The record has been permanently deleted.' });
    setIsDeleteOpen(false);
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password || '',
      role: user.role,
      status: user.status
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
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Institutional Directory</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access control and user records.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
              <Plus className="h-4 w-4" /> Register New User
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Register New Institutional User</DialogTitle>
              <DialogDescription>Add a student, faculty member, or administrator to the system.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                    className="bg-slate-50 border-none" required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                    className="bg-slate-50 border-none" required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="bg-slate-50 border-none" required 
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Temporary Password
                </Label>
                <Input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="bg-slate-50 border-none" required 
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Portal Role</Label>
                  <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                    <SelectTrigger className="bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                    <SelectTrigger className="bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2">
                Provision Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-white border shadow-sm h-11 p-1 rounded-xl">
            <TabsTrigger value="all" className="gap-2 px-4 rounded-lg"><Users className="h-4 w-4" /> All</TabsTrigger>
            <TabsTrigger value="student" className="gap-2 px-4 rounded-lg"><GraduationCap className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 px-4 rounded-lg"><UserCog className="h-4 w-4" /> Faculty</TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 px-4 rounded-lg"><ShieldCheck className="h-4 w-4" /> Admins</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 bg-white border-none shadow-sm h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem]">
          <CardContent className="p-0">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing directory...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[300px] font-bold text-slate-900 py-4 pl-6">User Details</TableHead>
                    <TableHead className="font-bold text-slate-900">Portal Role</TableHead>
                    <TableHead className="font-bold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-900 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="group transition-colors hover:bg-slate-50/50 border-slate-100">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
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
                            "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 border-none",
                            u.role === 'admin' ? "bg-blue-50 text-blue-600" :
                            u.role === 'faculty' ? "bg-purple-50 text-purple-600" :
                            "bg-emerald-50 text-emerald-600"
                          )}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'inactive' ? 'bg-slate-300' : 'bg-emerald-500')} />
                            <span className="text-xs font-semibold text-slate-600 capitalize">{u.status}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full h-8 w-8 transition-all">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openView(u)}>
                              <Eye className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(u)}>
                              <Edit3 className="h-4 w-4" /> Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2 text-red-600" onClick={() => openDelete(u)}>
                              <Trash2 className="h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                        No users found matching your criteria.
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
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Edit User Record</DialogTitle>
            <DialogDescription>Update institutional permissions for {selectedUser?.firstName}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-slate-50 border-none" required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-slate-50 border-none" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (Read Only)</Label>
              <Input value={formData.email} disabled className="bg-slate-100 border-none opacity-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Portal Role</Label>
                <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                  <SelectTrigger className="bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                  <SelectTrigger className="bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>User Identity Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{selectedUser?.firstName} {selectedUser?.lastName}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Internal ID</p>
                <p className="font-mono text-xs">{selectedUser?.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Portal Access</p>
                <p className="capitalize">{selectedUser?.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Degree Track</p>
                <p>{selectedUser?.degreeType || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
                <Badge className={cn(selectedUser?.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500', "border-none")}>
                  {selectedUser?.status}
                </Badge>
              </div>
            </div>
            <Button className="w-full h-11" variant="outline" onClick={() => setIsViewOpen(false)}>Close Card</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> from the institutional directory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 rounded-xl" onClick={handleDeleteUser}>
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
