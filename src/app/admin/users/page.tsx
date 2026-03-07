'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, collection } from 'firebase/firestore';
import { useUser, useFirestore, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Users, ShieldCheck, ArrowLeft, Filter, Download, MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

export default function UserManagementPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [tempId, setTempId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/login');
    }
  }, [authUser, isUserLoading, router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !tempId) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'All fields are required.',
      });
      return;
    }

    setIsSubmitting(true);
    const userRef = doc(firestore, 'colleges', collegeId, 'users', tempId);
    
    setDocumentNonBlocking(userRef, {
      id: tempId,
      collegeId: collegeId,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
    }, { merge: true });

    toast({
      title: 'User Record Created',
      description: `${firstName} ${lastName} has been added as a ${role}.`,
    });

    setEmail('');
    setFirstName('');
    setLastName('');
    setTempId('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access for students, faculty, and administrators.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white">
                <Download className="h-4 w-4" /> Export CSV
            </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Form Card */}
        <Card className="lg:col-span-1 border-none shadow-sm h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" /> New Registration
            </CardTitle>
            <CardDescription>Enter details from Firebase Auth to provision a profile.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateUser}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id" className="text-xs font-bold uppercase text-muted-foreground">User UID</Label>
                <Input id="id" placeholder="Paste Auth UID" value={tempId} onChange={(e) => setTempId(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase text-muted-foreground">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase text-muted-foreground">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-50 border-none focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-bold uppercase text-muted-foreground">Portal Access</Label>
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
            </CardContent>
            <div className="p-6 pt-0">
              <Button className="w-full shadow-md shadow-primary/20 font-bold" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Provision User
              </Button>
            </div>
          </form>
        </Card>

        {/* Directory Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 bg-white border-none shadow-sm focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 bg-white">
                <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {isUsersLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px] font-bold text-slate-900">User Profile</TableHead>
                      <TableHead className="font-bold text-slate-900">Portal / Role</TableHead>
                      <TableHead className="font-bold text-slate-900">Status</TableHead>
                      <TableHead className="text-right font-bold text-slate-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((u) => (
                      <TableRow key={u.id} className="group transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                {u.firstName[0]}{u.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{u.firstName} {u.lastName}</span>
                              <span className="text-xs text-muted-foreground">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "font-bold uppercase tracking-widest text-[10px] px-2 py-1",
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
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-xs font-semibold text-slate-600">Active</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Users className="h-8 w-8 opacity-20" />
                            <p className="font-medium">No user records found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
