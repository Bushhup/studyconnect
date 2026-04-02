'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Eye, Trash2, Loader2, CheckCircle2, Lock, AlertCircle,
  AtSign
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
  const router = useRouter();
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

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !isAdmin) return;
    if (!formData.username || !formData.email || !formData.password) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Institutional Username, Email, and Password are required.' });
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
      username: formData.username
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
                  <Label className="flex items-center gap-2">
                    <AtSign className="h-3.5 w-3.5 text-muted-foreground" /> Unique Username
                  </Label>
                  <Input 
                    placeholder="e.g. student_2024_01"
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    className="bg-muted border-none" required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                      className="bg-muted border-none" required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                      className="bg-muted border-none" required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address (For System Auth)</Label>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="bg-muted border-none" required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Initial Password
                  </Label>
                  <Input 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="bg-muted border-none" required 
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Portal Role</Label>
                    <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                      <SelectTrigger className="bg-muted border-none shadow-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                      <SelectTrigger className="bg-muted border-none shadow-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2">
                  Confirm Provisioning
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
              className="pl-10 bg-card border shadow-sm h-11 rounded-xl"
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
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
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
              <Label>Institutional Username</Label>
              <Input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                className="bg-muted border-none font-bold text-primary" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-muted border-none" required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-muted border-none" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Portal Role</Label>
                <Select onValueChange={(val) => setFormData({...formData, role: val})} value={formData.role}>
                  <SelectTrigger className="bg-muted border-none shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select onValueChange={(val) => setFormData({...formData, status: val})} value={formData.status}>
                  <SelectTrigger className="bg-muted border-none shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 mt-2">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Apply Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-[2rem] bg-card border-none">
          <DialogHeader>
            <DialogTitle>Institutional Identity Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl border border-border">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</h3>
                <p className="text-xs font-bold text-primary uppercase">@{selectedUser?.username}</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Portal Access</p>
                <p className="capitalize text-foreground">{selectedUser?.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
                <Badge className={cn(selectedUser?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground', "border-none")}>
                  {selectedUser?.status}
                </Badge>
              </div>
            </div>
            <Button className="w-full h-11" variant="outline" onClick={() => setIsViewOpen(false)}>Close Identity View</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[2rem] bg-card border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Institutional De-provisioning</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm removal of <strong>@{selectedUser?.username}</strong> ({selectedUser?.firstName} {selectedUser?.lastName}). This action permanently deletes their institutional record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 rounded-xl" onClick={handleDeleteUser}>
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}