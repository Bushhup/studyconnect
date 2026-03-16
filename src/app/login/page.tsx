
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    const normalizedUsername = username.trim();

    try {
      // 0. Demo Account Logic
      // Restrict 'demo' account to only student or faculty roles
      if (normalizedUsername.toLowerCase() === 'demo' && password === 'demo123') {
        if (selectedRole === 'admin') {
          throw new Error('Demo accounts are restricted to Student and Faculty portals only.');
        }
        
        await signInAnonymously(auth);
        toast({ title: 'Demo Access Granted', description: `Authenticated as a guest ${selectedRole}.` });
        router.push('/profile');
        return;
      }

      // 1. Hardcoded Admin Logic
      const adminUser = 'Admin01';
      const adminPass = 'minister123';

      if (selectedRole === 'admin') {
        if (normalizedUsername.toLowerCase() === adminUser.toLowerCase() && password === adminPass) {
          const userCredential = await signInAnonymously(auth);
          const newUser = userCredential.user;
          
          // Attempt to provision the admin profile in Firestore
          const adminDocRef = doc(firestore, 'colleges', collegeId, 'users', newUser.uid);
          try {
            await setDoc(adminDocRef, {
              id: newUser.uid,
              uid: newUser.uid,
              username: 'Admin01',
              email: 'admin-session@college.edu',
              role: 'admin',
              firstName: 'System',
              lastName: 'Administrator',
              status: 'active',
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (ruleErr) {
            console.warn("Silent failure on admin profile write - proceeding with session.", ruleErr);
          }

          toast({ title: 'System Access Granted', description: 'Administrative session established.' });
          router.push('/admin/dashboard');
          return;
        } else {
          throw new Error('Invalid administrative credentials.');
        }
      }

      // 2. Institutional User Login Logic (Username -> Email Resolution)
      const usersRef = collection(firestore, 'colleges', collegeId, 'users');
      const q = query(usersRef, where('username', '==', normalizedUsername));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err: any) {
        if (err.message?.includes('permissions')) {
          throw new Error('Institutional directory is currently locked. Please contact support.');
        }
        throw err;
      }

      if (querySnapshot.empty) {
        throw new Error('Username not found in institutional directory.');
      }

      const userData = querySnapshot.docs[0].data();
      const userEmail = userData.email;

      if (userData.role !== selectedRole) {
        throw new Error(`This account is not registered as ${selectedRole}.`);
      }

      try {
        // Attempt standard Auth sign-in
        await signInWithEmailAndPassword(auth, userEmail, password);
        toast({ title: 'Welcome Back', description: `Authenticated as ${userData.firstName}.` });
        router.push('/profile');
      } catch (authError: any) {
        // Handle bootstrapping if Auth account doesn't exist yet but Firestore doc does
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
          // Verify against provisioned password in Firestore
          if (userData.password === password) {
            // First-time login: Create Auth account
            const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
            const newUser = userCredential.user;
            
            const newDocRef = doc(firestore, 'colleges', collegeId, 'users', newUser.uid);
            const oldDocId = querySnapshot.docs[0].id;
            const oldDocRef = doc(firestore, 'colleges', collegeId, 'users', oldDocId);
            
            // Migrate data
            await setDoc(newDocRef, {
              ...userData,
              id: newUser.uid,
              uid: newUser.uid,
              authBootstrapped: true,
              updatedAt: new Date().toISOString()
            });

            if (oldDocId !== newUser.uid) {
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
      <Card className="w-full max-w-md shadow-2xl overflow-hidden bg-white border-primary/20 rounded-[2rem]">
        <div className="h-2 bg-primary w-full" />
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit p-0 mb-4 hover:bg-transparent text-muted-foreground" onClick={() => setSelectedRole(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Switch Portal
          </Button>
          <CardTitle className="text-2xl font-headline text-center capitalize">{selectedRole} Portal</CardTitle>
          <CardDescription className="text-center">Enter your institutional username.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input 
                type="text" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="h-11 bg-slate-50 border-none" 
                placeholder="e.g. demo or Admin01"
              />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-11 bg-slate-50 border-none" 
                placeholder="e.g. demo123"
              />
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
