'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';

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
        description: 'Please enter both email and password.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      const userDocRef = doc(firestore, 'colleges', collegeId, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || userDoc.data().role !== selectedRole) {
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: `This account does not have ${selectedRole} permissions.`,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Login Successful',
        description: `Welcome to the ${selectedRole} portal!`,
      });
    } catch (error: any) {
      let errorMessage = 'An error occurred during login.';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold mb-4">Select Portal</h1>
          <p className="text-muted-foreground font-body max-w-md">Choose your access level to continue to the dashboard.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
          <RoleCard 
            role="student" 
            title="Student" 
            icon={GraduationCap}
            onClick={() => setSelectedRole('student')}
          />
          <RoleCard 
            role="faculty" 
            title="Faculty" 
            icon={BookOpen}
            onClick={() => setSelectedRole('faculty')}
          />
          <RoleCard 
            role="admin" 
            title="Administrator" 
            icon={ShieldCheck}
            onClick={() => setSelectedRole('admin')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit p-0 mb-4 hover:bg-transparent text-muted-foreground"
            onClick={() => setSelectedRole(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <CardTitle className="text-2xl font-headline text-center capitalize">
            {selectedRole} Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
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
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-headline h-11" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function RoleCard({ title, icon: Icon, onClick }: { 
  role: UserRole, 
  title: string, 
  icon: any, 
  onClick: () => void 
}) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-2xl transition-all duration-300 group border-primary/10 hover:border-primary/40 bg-card/50"
      onClick={onClick}
    >
      <CardHeader className="text-center py-10">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="w-8 h-8" />
        </div>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardFooter className="pb-8 justify-center">
        <Button variant="outline" className="px-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          Enter
        </Button>
      </CardFooter>
    </Card>
  );
}
