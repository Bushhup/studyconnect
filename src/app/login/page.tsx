'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, BookOpen, ShieldCheck, ArrowLeft, Info } from 'lucide-react';

type UserRole = 'student' | 'faculty' | 'admin';

const collegeId = 'study-connect-college';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Instant redirect if already authenticated and fully migrated
  useEffect(() => {
    if (user && !isLoading) {
      const checkProfileAndRedirect = async () => {
        const userDocRef = doc(firestore, 'colleges', collegeId, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          if (userDoc.data().role === 'admin') {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/profile');
          }
        }
      };
      checkProfileAndRedirect();
    }
  }, [user, router, isLoading, firestore]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please select a portal and enter credentials.',
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    setIsLoading(true);
    
    try {
      let userCredential;
      let needsMigration = false;
      let migrationSourceData: any = null;

      try {
        // 1. Attempt standard sign-in
        userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (authError: any) {
        // 2. Fallback to Bootstrap logic if sign-in fails
        const emailDocRef = doc(firestore, 'colleges', collegeId, 'users', cleanEmail);
        const emailDoc = await getDoc(emailDocRef);

        if (emailDoc.exists()) {
          const userData = emailDoc.data();
          if (userData.password === password) {
            if (userData.role !== selectedRole) {
              throw new Error(`Account registered as ${userData.role}, not ${selectedRole}.`);
            }

            try {
              userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            } catch (createError: any) {
              if (createError.code === 'auth/email-already-in-use') {
                // Already in Auth but migration failed previously
                userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
              } else {
                throw createError;
              }
            }
            needsMigration = true;
            migrationSourceData = userData;
          } else {
            throw new Error("Invalid password for institutional account.");
          }
        } else if (cleanEmail === 'admin01@college.edu' && password === 'minister123' && selectedRole === 'admin') {
          // Special case for initial system admin
          try {
            userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } catch (err: any) {
            userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          }
        } else {
          throw new Error("Account not found in directory or invalid credentials.");
        }
      }

      const loggedInUser = userCredential!.user;
      const uidDocRef = doc(firestore, 'colleges', collegeId, 'users', loggedInUser.uid);
      const emailDocRef = doc(firestore, 'colleges', collegeId, 'users', cleanEmail);

      // Check if we need to perform/finish migration
      if (needsMigration || cleanEmail === 'admin01@college.edu') {
        const batch = writeBatch(firestore);
        
        // If we have migration data from bootstrap step, use it
        const finalData = migrationSourceData || {
          id: loggedInUser.uid,
          collegeId,
          email: cleanEmail,
          firstName: 'System',
          lastName: 'Admin',
          role: 'admin',
          status: 'active'
        };

        batch.set(uidDocRef, {
          ...finalData,
          id: loggedInUser.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Cleanup temporary email record if it exists
        const emailDoc = await getDoc(emailDocRef);
        if (emailDoc.exists()) {
          batch.delete(emailDocRef);
        }

        await batch.commit();
      }

      // Final Role Verification
      const finalDoc = await getDoc(uidDocRef);
      if (!finalDoc.exists() || finalDoc.data().role !== selectedRole) {
        await signOut(auth);
        throw new Error(`Unauthorized access. Expected ${selectedRole} role.`);
      }

      toast({ title: 'Login Successful', description: `Welcome, ${finalDoc.data().firstName}!` });
      router.push(selectedRole === 'admin' ? '/admin/dashboard' : '/profile');

    } catch (error: any) {
      console.error('Auth Error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid credentials.',
      });
      setIsLoading(false);
    }
  };

  const useDemoAdmin = () => {
    setEmail('admin01@college.edu');
    setPassword('minister123');
    setSelectedRole('admin');
  };

  if (!selectedRole) {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-slate-900">Portal Selection</h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Choose your access level to continue to the StudyConnect dashboard.
          </p>
        </div>
        
        <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl max-w-5xl w-full">
          <div className="grid gap-8 md:grid-cols-3">
            <RoleCard 
              role="student" 
              title="Student" 
              description="Courses, grades, and campus events."
              icon={GraduationCap}
              onClick={() => setSelectedRole('student')}
            />
            <RoleCard 
              role="faculty" 
              title="Faculty" 
              description="Classes, research, and materials."
              icon={BookOpen}
              onClick={() => setSelectedRole('faculty')}
            />
            <RoleCard 
              role="admin" 
              title="Administrator" 
              description="System management and provisioning."
              icon={ShieldCheck}
              onClick={() => setSelectedRole('admin')}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 px-4 py-2 rounded-full border">
            <Info className="h-4 w-4" />
            <span>Dev Mode: <strong>admin01@college.edu</strong> / <strong>minister123</strong></span>
          </div>
          <Button variant="outline" size="sm" onClick={useDemoAdmin} className="rounded-full">
            Auto-fill Admin Credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-sm shadow-2xl border-primary/10 overflow-hidden bg-white">
        <div className="h-2 bg-primary w-full" />
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit p-0 mb-4 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setSelectedRole(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Change Portal
          </Button>
          <CardTitle className="text-2xl font-headline text-center capitalize text-slate-900">
            {selectedRole} Sign In
          </CardTitle>
          <CardDescription className="text-center font-body">
            Access your secure dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@college.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-slate-50 border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-slate-50 border-slate-200"
              />
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full font-headline h-12 text-lg shadow-lg hover:shadow-xl transition-all" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Verifying...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, onClick }: { 
  role: UserRole, 
  title: string, 
  description: string,
  icon: any, 
  onClick: () => void 
}) {
  return (
    <div 
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 group-active:duration-200"></div>
      <Card 
        className="relative h-full transition-all duration-300 border-primary/5 bg-card hover:bg-accent/5 hover:-translate-y-2 overflow-hidden flex flex-col items-center text-center p-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 transform group-hover:rotate-3 shadow-sm group-hover:shadow-lg">
          <Icon className="w-10 h-10" />
        </div>
        <CardTitle className="font-headline text-2xl mb-2">{title}</CardTitle>
        <CardDescription className="font-body text-balance leading-relaxed">
          {description}
        </CardDescription>
        <div className="h-1 w-full bg-primary/0 group-hover:bg-primary/100 transition-all duration-500 absolute bottom-0" />
      </Card>
    </div>
  );
}