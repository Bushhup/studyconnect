
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, BookOpen, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

type UserRole = 'student' | 'faculty' | 'admin';
const collegeId = 'study-connect-college';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (selectedRole === 'admin') {
        if (normalizedEmail === adminEmail?.trim().toLowerCase() && password === adminPass) {
          const userCredential = await signInAnonymously(auth);
          const newUser = userCredential.user;
          
          // Ensure admin record is fully synchronized before proceeding
          const adminDocRef = doc(firestore, 'colleges', collegeId, 'users', newUser.uid);
          await setDoc(adminDocRef, {
            id: newUser.uid,
            uid: newUser.uid,
            email: 'admin-session@college.edu',
            role: 'admin',
            firstName: 'System',
            lastName: 'Administrator',
            status: 'active',
            updatedAt: new Date().toISOString()
          }, { merge: true });

          toast({ title: 'System Access Granted', description: 'Administrative session established.' });
          router.push('/admin/dashboard');
          return;
        } else {
          throw new Error('Invalid administrative credentials.');
        }
      }

      // 1. Attempt standard login
      try {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        toast({ title: 'Welcome Back', description: `Authenticated as ${selectedRole}.` });
        router.push('/profile');
      } catch (authError: any) {
        // 2. If standard login fails, check for provisioned user in Firestore
        const usersRef = collection(firestore, 'colleges', collegeId, 'users');
        const q = query(usersRef, where('email', '==', normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          
          if (userData.password === password) {
            const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            const newUser = userCredential.user;
            
            const newDocRef = doc(firestore, 'colleges', collegeId, 'users', newUser.uid);
            const oldDocRef = doc(firestore, 'colleges', collegeId, 'users', querySnapshot.docs[0].id);
            
            await setDoc(newDocRef, {
              ...userData,
              id: newUser.uid,
              uid: newUser.uid,
              authBootstrapped: true,
              updatedAt: new Date().toISOString()
            });

            if (oldDocRef.id !== newDocRef.id) {
              await deleteDoc(oldDocRef);
            }

            toast({ title: 'Account Activated', description: 'Institutional profile linked.' });
            router.push('/profile');
          } else {
            throw new Error('Invalid institutional password.');
          }
        } else {
          throw authError;
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Institutional Access</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Select your portal to continue.</p>
        </div>
        
        <div className="bg-card border rounded-[3rem] p-8 md:p-12 shadow-xl max-w-5xl w-full">
          <div className="grid gap-8 md:grid-cols-3">
            <RoleCard role="student" title="Student" description="Grades & Courses" icon={GraduationCap} onClick={() => setSelectedRole('student')} />
            <RoleCard role="faculty" title="Faculty" description="Class Management" icon={BookOpen} onClick={() => setSelectedRole('faculty')} />
            <RoleCard role="admin" title="Admin" description="System Config" icon={ShieldCheck} onClick={() => setSelectedRole('admin')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-sm shadow-2xl overflow-hidden bg-white border-primary/20 rounded-[2rem]">
        <div className="h-2 bg-primary w-full" />
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit p-0 mb-4 hover:bg-transparent" onClick={() => setSelectedRole(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Switch Portal
          </Button>
          <CardTitle className="text-2xl font-headline text-center capitalize">{selectedRole} Portal</CardTitle>
          <CardDescription className="text-center">Enter credentials.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{selectedRole === 'admin' ? 'Username' : 'Email'}</Label>
              <Input type={selectedRole === 'admin' ? 'text' : 'email'} required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-slate-50 border-none" />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-slate-50 border-none" />
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Enter Portal'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, onClick }: any) {
  return (
    <Card className="cursor-pointer transition-all hover:bg-accent/5 hover:-translate-y-1 flex flex-col items-center text-center p-8 border-none shadow-sm bg-white rounded-[2.5rem]" onClick={onClick}>
      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <CardTitle className="font-headline text-xl mb-1">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}
