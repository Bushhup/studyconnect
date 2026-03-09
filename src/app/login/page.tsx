'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { getLocalData } from '@/lib/mock-db';
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
  const { login } = useFirebase() as any;
  const router = useRouter();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) {
      toast({ variant: 'destructive', title: 'Selection Required', description: 'Please select a portal.' });
      return;
    }

    setIsLoading(true);
    
    // Simulate 500ms network delay
    setTimeout(() => {
      const cleanEmail = email.toLowerCase().trim();
      const users = getLocalData('users');
      const user = users.find((u: any) => u.email === cleanEmail && u.password === password);

      if (!user) {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'Invalid email or password.' });
        setIsLoading(false);
        return;
      }

      if (user.role !== selectedRole) {
        toast({ variant: 'destructive', title: 'Wrong Portal', description: `This account belongs to the ${user.role} portal.` });
        setIsLoading(false);
        return;
      }

      login(user);
      toast({ title: 'Welcome Back', description: `Access granted to ${user.firstName}.` });
      router.push(selectedRole === 'admin' ? '/admin/dashboard' : '/profile');
    }, 500);
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
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Institutional Access</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Select your portal to continue.</p>
        </div>
        
        <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl max-w-5xl w-full">
          <div className="grid gap-8 md:grid-cols-3">
            <RoleCard role="student" title="Student" description="Grades & Courses" icon={GraduationCap} onClick={() => setSelectedRole('student')} />
            <RoleCard role="faculty" title="Faculty" description="Class Management" icon={BookOpen} onClick={() => setSelectedRole('faculty')} />
            <RoleCard role="admin" title="Admin" description="System Config" icon={ShieldCheck} onClick={() => setSelectedRole('admin')} />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground bg-accent/50 px-4 py-2 rounded-full border">
            Demo: <strong>admin01@college.edu</strong> / <strong>minister123</strong>
          </div>
          <Button variant="outline" size="sm" onClick={useDemoAdmin} className="rounded-full">
            Instant Demo Sign-In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-sm shadow-2xl overflow-hidden bg-white">
        <div className="h-2 bg-primary w-full" />
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit p-0 mb-4" onClick={() => setSelectedRole(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Switch Portal
          </Button>
          <CardTitle className="text-2xl font-headline text-center capitalize">{selectedRole} Portal</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-11" />
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full h-12 text-lg" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign In'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, onClick }: any) {
  return (
    <Card className="cursor-pointer transition-all hover:bg-accent/5 hover:-translate-y-1 flex flex-col items-center text-center p-8" onClick={onClick}>
      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <CardTitle className="font-headline text-xl mb-1">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}
