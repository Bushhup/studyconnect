
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, BookOpen, ShieldCheck, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

type UserRole = 'student' | 'faculty' | 'admin' | 'hod';
const collegeId = 'study-connect-college';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!selectedRole) return;
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Institutional Verification
      const usersRef = collection(firestore, 'colleges', collegeId, 'users');
      const q = query(usersRef, where('email', '==', googleUser.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Not pre-registered by admin
        await signOut(auth);
        throw new Error('Your email is not registered in the institutional directory. Please contact the administrator.');
      }

      const userData = querySnapshot.docs[0].data();
      const docId = querySnapshot.docs[0].id;

      if (userData.role !== selectedRole && !(selectedRole === 'admin' && userData.role === 'admin')) {
        await signOut(auth);
        throw new Error(`This account is registered as a ${userData.role}, not a ${selectedRole}.`);
      }

      // Link the Firestore document to this Firebase Auth UID if not already linked
      const userRef = doc(firestore, 'colleges', collegeId, 'users', docId);
      
      // We use the auth UID to update the document to make rules easier
      // If docId is already a UUID (from pre-registration), we might want to consolidate
      // But for simplicity, we update the existing doc with the new UID for rule matching
      await updateDoc(userRef, {
        uid: googleUser.uid,
        lastLogin: new Date().toISOString(),
        photoURL: googleUser.photoURL,
        authProvider: 'google'
      });

      // Special case for Admin rules
      if (userData.role === 'admin') {
        const rootAdminRef = doc(firestore, 'admins', googleUser.uid);
        await setDoc(rootAdminRef, { id: googleUser.uid }, { merge: true });
      }

      toast({ title: 'Authentication Successful', description: `Welcome back, ${userData.firstName}.` });
      
      // Redirect based on role
      const routes = {
        admin: '/admin/dashboard',
        hod: '/admin/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      };
      
      router.push(routes[userData.role as keyof typeof routes] || '/profile');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: error.message || 'Verification failed.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !selectedRole) return;

    setIsLoading(true);
    try {
      // Standard email/pass check against pre-registered data
      const usersRef = collection(firestore, 'colleges', collegeId, 'users');
      const q = query(usersRef, where('email', '==', username.includes('@') ? username : `${username}@college.edu`));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Identity not found in directory.');
      }

      const userData = querySnapshot.docs[0].data();
      
      if (userData.password !== password) {
        throw new Error('Invalid institutional password.');
      }

      // Sign in or create auth user (Bootstrapping)
      try {
        await signInWithEmailAndPassword(auth, userData.email, password);
      } catch (ae) {
        // Simple bypass for prototype if auth doesn't exist yet
        toast({ title: 'Prototype Mode', description: 'Institutional password accepted.' });
      }

      toast({ title: 'Welcome Back', description: `Authenticated as ${userData.firstName}.` });
      
      const routes = {
        admin: '/admin/dashboard',
        hod: '/admin/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      };
      router.push(routes[userData.role as keyof typeof routes] || '/profile');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-foreground">Institutional Access</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Select your portal to continue.</p>
        </div>
        
        <div className="bg-card border rounded-[3rem] p-8 md:p-12 shadow-xl max-w-5xl w-full">
          <div className="grid gap-8 md:grid-cols-3">
            <RoleCard role="student" title="Student" description="Grades & Courses" icon={GraduationCap} onClick={() => setSelectedRole('student')} />
            <RoleCard role="faculty" title="Faculty" description="Class Management" icon={BookOpen} onClick={() => setSelectedRole('faculty')} />
            <RoleCard role="admin" title="Admin / HOD" description="System Config" icon={ShieldCheck} onClick={() => setSelectedRole('admin')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden bg-card border-primary/20 rounded-[2.5rem]">
        <div className="h-2 bg-primary w-full" />
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit p-0 mb-4 hover:bg-transparent text-muted-foreground" onClick={() => setSelectedRole(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Switch Portal
          </Button>
          <CardTitle className="text-2xl font-headline text-center capitalize">{selectedRole} Portal</CardTitle>
          <CardDescription className="text-center">Authenticate using your institutional credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl gap-3 font-bold border-border bg-background hover:bg-muted transition-all"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 3.86-.98 5.15-2.67l-3.57-2.77c-.98.66-2.23 1.06-3.58 1.06-2.76 0-5.09-1.87-5.93-4.39H.43v2.83C2.24 20.67 6.83 23 12 23z" fill="#34A853"/>
              <path d="M6.07 14.23c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.24H.43C.16 8.13 0 9.04 0 10s.16 1.87.43 2.76l5.64-4.53z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 6.83 1 2.24 3.33.43 7.24l5.64 2.83C6.91 7.25 9.24 5.38 12 5.38z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card px-2 text-muted-foreground tracking-widest">Or Secure Password</span></div>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email / Username</Label>
              <Input 
                type="text" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="h-12 bg-muted border-none rounded-xl" 
                placeholder="alex@college.edu"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Pin / Password</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-12 bg-muted border-none rounded-xl" 
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl mt-2" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Enter Portal'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 py-4 justify-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
            Locked to Institutional Directory • SC-v7.4
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, onClick }: any) {
  return (
    <Card className="cursor-pointer transition-all hover:bg-primary/5 hover:-translate-y-1 flex flex-col items-center text-center p-8 border-none shadow-sm bg-muted/30 rounded-[2.5rem]" onClick={onClick}>
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <CardTitle className="font-headline text-xl mb-1">{title}</CardTitle>
      <CardDescription className="text-muted-foreground">{description}</CardDescription>
    </Card>
  );
}
