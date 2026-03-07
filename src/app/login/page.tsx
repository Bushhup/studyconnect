'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore } from '@/firebase';
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

  const collegeId = 'study-connect-college';

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/profile');
    }
  }, [user, router, isLoading]);

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

    setIsLoading(true);
    try {
      let userCredential;
      try {
        // Attempt normal sign in
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        // Bootstrap logic: If the specific requested admin credentials are used and sign-in fails, try creating the user
        if (email === 'admin01@college.edu' && password === 'minister123' && selectedRole === 'admin') {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: 'Admin Created',
            description: 'The initial administrator account has been provisioned.',
          });
        } else {
          throw authError; // Re-throw if not the bootstrap user
        }
      }

      const loggedInUser = userCredential.user;
      const userDocRef = doc(firestore, 'colleges', collegeId, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      // Ensure the Firestore profile exists for the bootstrapped admin
      if (!userDoc.exists() && email === 'admin01@college.edu' && selectedRole === 'admin') {
        await setDoc(userDocRef, {
          id: loggedInUser.uid,
          collegeId: collegeId,
          email: email,
          firstName: 'System',
          lastName: 'Admin',
          role: 'admin',
        });
      } else if (!userDoc.exists() || userDoc.data()?.role !== selectedRole) {
        // Check role mismatch (except for the bootstrap case handled above)
        if (!(email === 'admin01@college.edu' && selectedRole === 'admin')) {
            await signOut(auth);
            toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: `This account does not have ${selectedRole} permissions.`,
            });
            setIsLoading(false);
            return;
        }
      }

      toast({
        title: 'Login Successful',
        description: `Welcome to the ${selectedRole} portal!`,
      });
    } catch (error: any) {
      let errorMessage = 'An error occurred during login.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
          // This might happen if user exists but password was wrong in the first attempt
          errorMessage = 'Invalid password for this account.';
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
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
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Portal Selection</h1>
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
            <span>Development Mode: Use <strong>admin01@college.edu</strong> / <strong>minister123</strong> for Admin access.</span>
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
      <Card className="w-full max-w-sm shadow-2xl border-primary/10 overflow-hidden">
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
          <CardTitle className="text-2xl font-headline text-center capitalize">
            {selectedRole} Sign In
          </CardTitle>
          <CardDescription className="text-center font-body">
            Access your secure dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@college.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
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
                className="h-11"
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
