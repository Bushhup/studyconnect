
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Lock, 
  UserPlus, 
  Building2,
  Phone,
  UserCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const collegeId = 'study-connect-college';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    role: 'student',
    departmentId: '',
    batchYear: '',
    uid: ''
  });

  // Fetch Departments for selection
  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  const { data: departments, isLoading: deptsLoading } = useCollection(deptsQuery);

  const handleGoogleSignup = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (!googleUser.email) throw new Error('Google account must have a primary email.');

      // Check if user already exists
      const userRef = doc(firestore, 'colleges', collegeId, 'users', googleUser.email.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        toast({ title: 'Account Exists', description: 'This email is already registered. Redirecting to login...' });
        router.push('/login');
        return;
      }

      // Pre-fill form from Google data
      const names = googleUser.displayName?.split(' ') || ['', ''];
      setFormData(prev => ({
        ...prev,
        firstName: names[0],
        lastName: names.slice(1).join(' '),
        email: googleUser.email!.toLowerCase(),
        uid: googleUser.uid
      }));
      
      setIsGoogleLinked(true);
      toast({ title: 'Google Identity Linked', description: 'Please complete your institutional mapping below.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Link Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!formData.departmentId) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select an academic department.' });
      return;
    }

    setIsLoading(true);
    try {
      const email = formData.email.toLowerCase();
      let finalUid = formData.uid;

      // 1. Create Firebase Auth User if not already authenticated via Google
      if (!isGoogleLinked) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
        finalUid = userCredential.user.uid;
      }

      // 2. Create Institutional Directory Record
      const userRef = doc(firestore, 'colleges', collegeId, 'users', email);
      await setDoc(userRef, {
        ...formData,
        id: email,
        uid: finalUid,
        email: email,
        username: email.split('@')[0],
        status: 'active',
        createdAt: new Date().toISOString(),
        authProvider: isGoogleLinked ? 'google' : 'password'
      });

      toast({ 
        title: 'Registration Successful', 
        description: `Welcome to StudyConnect, ${formData.firstName}! Initializing your portal...` 
      });

      const routes = {
        admin: '/admin/dashboard',
        hod: '/admin/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      };
      router.push(routes[formData.role as keyof typeof routes] || '/profile');

    } catch (error: any) {
      console.error('Signup Error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An error occurred during account creation.'
      });
      setIsLoading(false);
    }
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    const groups = [digits.slice(0, 5), digits.slice(5)].filter(Boolean);
    return groups.join(' ');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background selection:bg-primary/20">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-card/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <CardHeader className="space-y-4 pt-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button asChild variant="ghost" size="sm" className="w-fit p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest">
                <Link href="/login"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Login</Link>
              </Button>
              <div className="p-3 bg-white rounded-2xl shadow-sm border">
                <Logo className="h-10 w-10" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-headline font-bold tracking-tight">Create Account</CardTitle>
              <CardDescription className="text-base font-body">Join the institutional directory to access your academic portal.</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {!isGoogleLinked && (
              <>
                <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 font-bold border-border bg-background hover:bg-muted transition-all" onClick={handleGoogleSignup} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 3.86-.98 5.15-2.67l-3.57-2.77c-.98.66-2.23 1.06-3.58 1.06-2.76 0-5.09-1.87-5.93-4.39H.43v2.83C2.24 20.67 6.83 23 12 23z" fill="#34A853"/>
                      <path d="M6.07 14.23c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.24H.43C.16 8.13 0 9.04 0 10s.16 1.87.43 2.76l5.64-4.53z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 6.83 1 2.24 3.33.43 7.24l5.64 2.83C6.91 7.25 9.24 5.38 12 5.38z" fill="#EA4335"/>
                    </svg>
                  )}
                  Institutional Google Sign-Up
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold">
                    <span className="bg-card px-4 text-muted-foreground tracking-widest">Or Register Manually</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Alex" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="h-12 bg-muted border-none rounded-xl text-sm"
                    disabled={isGoogleLinked}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Johnson" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="h-12 bg-muted border-none rounded-xl text-sm"
                    disabled={isGoogleLinked}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Institutional Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      required 
                      placeholder="name@college.edu" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-12 pl-12 bg-muted border-none rounded-xl text-sm"
                      disabled={isGoogleLinked}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Mobile Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      required 
                      placeholder="xxxxx xxxxx" 
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({...formData, mobileNumber: formatPhone(e.target.value)})}
                      className="h-12 pl-12 bg-muted border-none rounded-xl text-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Portal Access</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v: any) => setFormData({...formData, role: v})}
                  >
                    <SelectTrigger className="h-12 bg-muted border-none rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student Portal</SelectItem>
                      <SelectItem value="faculty">Faculty Portal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(v) => setFormData({...formData, departmentId: v})}
                  >
                    <SelectTrigger className="h-12 bg-muted border-none rounded-xl">
                      <SelectValue placeholder={deptsLoading ? "Loading..." : "Select Department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Batch Year</Label>
                  <Input 
                    placeholder="e.g. Batch-2026" 
                    value={formData.batchYear}
                    onChange={(e) => setFormData({...formData, batchYear: e.target.value})}
                    className="h-12 bg-muted border-none rounded-xl text-sm" 
                  />
                </div>
              )}

              {!isGoogleLinked && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Portal Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      required 
                      placeholder="Create a strong password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 pl-12 bg-muted border-none rounded-xl text-sm" 
                    />
                  </div>
                </div>
              )}

              {isGoogleLinked && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-medium">Your identity is verified via Google. No password required.</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl mt-4" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
                {isGoogleLinked ? 'Finalize Google Registration' : 'Register Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 py-6 justify-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Log in here</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
