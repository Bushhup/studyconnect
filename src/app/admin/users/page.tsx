'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, collection, query, getDocs } from 'firebase/firestore';
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
import { Loader2, UserPlus, Users, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
  const [tempId, setTempId] = useState(''); // In a real app, IDs are handled by Auth
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for admin access
  const adminProfileRef = useMemoFirebase(() => {
    if (!authUser || !firestore) return null;
    return doc(firestore, 'colleges', collegeId, 'users', authUser.uid);
  }, [authUser, firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'users');
  }, [firestore]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

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

    // Reset form
    setEmail('');
    setFirstName('');
    setLastName('');
    setTempId('');
    setIsSubmitting(false);
  };

  if (isUserLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
          <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
            <Users className="text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground mt-2">Provision accounts for students and faculty.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="lg:col-span-1 shadow-md h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Add New User
            </CardTitle>
            <CardDescription>Enter details to create a user record.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateUser}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">User UID (from Auth)</Label>
                <Input id="id" placeholder="Copy from Firebase Auth" value={tempId} onChange={(e) => setTempId(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(v: any) => setRole(v)} defaultValue={role}>
                  <SelectTrigger id="role">
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
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Add User Record
              </Button>
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUsersLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-primary/10 text-primary' : 
                          u.role === 'faculty' ? 'bg-accent/20 text-accent-foreground' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
